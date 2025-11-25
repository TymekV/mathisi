use async_openai::types::{
    ChatCompletionRequestMessage, ChatCompletionRequestSystemMessageArgs,
    ChatCompletionRequestUserMessageArgs, CreateChatCompletionRequestArgs,
};
use axum::{Extension, Json, extract::Path};
use axum_valid::Valid;
use color_eyre::eyre::eyre;
use sea_orm::{
    ActiveModelTrait, ActiveValue::Set, ColumnTrait, EntityTrait, ModelTrait, QueryFilter,
};
use serde::{Deserialize, Serialize};
use utoipa::ToSchema;
use utoipa_axum::{router::OpenApiRouter, routes};
use validator::Validate;

use crate::{
    entity::{note, question, quiz, user},
    errors::{AxumError, AxumResult, NotFoundError},
    middlewares::UnauthorizedError,
    state::AppState,
};

pub fn routes() -> OpenApiRouter<AppState> {
    OpenApiRouter::new()
        .routes(routes!(get_quizes))
        .routes(routes!(create_quiz))
}

#[derive(Serialize, ToSchema, Deserialize)]
pub struct Question {
    pub title: String,
    pub answers: Vec<String>,
    pub correct: i32,
}

#[derive(Serialize, ToSchema)]
pub struct QuizResponse {
    pub id: i32,
    pub questions: Vec<Question>,
}

/// Get quiz for note
#[utoipa::path(
    method(get),
    path = "/",
    params(
        ("id" = i32, Path, description = "Note id")
    ),
    responses(
        (status = OK, description = "Success", body = QuizResponse),
        (status = NOT_FOUND, description = "Not found", body = NotFoundError),
        (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),
    tag = "Quizes"
)]
pub async fn get_quizes(
    Extension(state): Extension<AppState>,
    Extension(user): Extension<user::Model>,
    Path(id): Path<i32>,
) -> AxumResult<Json<QuizResponse>> {
    let note = note::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AxumError::not_found(eyre!("Note not found")))?;

    if note.user_id != user.id && !note.public {
        return Err(AxumError::not_found(eyre!("Quiz not found for this note")));
    }

    let quiz_model = quiz::Entity::find()
        .filter(quiz::Column::NoteId.eq(id))
        .one(&state.db)
        .await?
        .ok_or_else(|| AxumError::not_found(eyre!("Quiz not found for this note")))?;

    let questions = quiz_model
        .find_related(question::Entity)
        .all(&state.db)
        .await?;

    let response = QuizResponse {
        id: quiz_model.id,
        questions: questions
            .into_iter()
            .map(|q| Question {
                title: q.title,
                answers: q.answers,
                correct: q.correct,
            })
            .collect(),
    };

    Ok(Json(response))
}

#[derive(Deserialize, ToSchema)]
struct AiQuizResponse {
    pub questions: Vec<Question>,
}

/// Create quiz for note
#[utoipa::path(
    method(post),
    path = "/",
    params(
        ("id" = i32, Path, description = "Note id")
    ),
    responses(
        (status = OK, description = "Success", body = QuizResponse),
        (status = NOT_FOUND, description = "Not found", body = NotFoundError),
        (status = UNAUTHORIZED, description = "Unauthorized", body = UnauthorizedError)
    ),

    tag = "Quizes"
)]
pub async fn create_quiz(
    Extension(state): Extension<AppState>,
    Extension(user): Extension<user::Model>,
    Path(id): Path<i32>,
) -> AxumResult<Json<QuizResponse>> {
    let note = note::Entity::find_by_id(id)
        .one(&state.db)
        .await?
        .ok_or_else(|| AxumError::not_found(eyre!("Note not found")))?;

    if note.user_id != user.id {
        return Err(AxumError::forbidden(eyre!(
            "You don't have permission to create quiz for this note"
        )));
    }

    let existing_quiz = quiz::Entity::find()
        .filter(quiz::Column::NoteId.eq(id))
        .one(&state.db)
        .await?;

    if existing_quiz.is_some() {
        return Err(AxumError::conflict(eyre!(
            "Quiz already exists for this note"
        )));
    }

    let system_message = ChatCompletionRequestSystemMessageArgs::default()
        .content("You are a quiz generator. Given a note content, create 5-10 multiple choice questions to test understanding. Return ONLY valid JSON in this exact format: {\"questions\": [{\"title\": \"question text\", \"answers\": [\"option1\", \"option2\", \"option3\", \"option4\"], \"correct\": 0}]} where 'correct' is the zero-based index of the correct answer. Each question must have exactly 4 answer options. Do not include any explanations, markdown, or text outside the JSON.")
        .build()?;

    let user_message = ChatCompletionRequestUserMessageArgs::default()
        .content(format!(
            "Generate a quiz from this note:\n\n{}",
            note.content
        ))
        .build()?;

    let request = CreateChatCompletionRequestArgs::default()
        .model(state.settings.ai.model_id.clone())
        .messages(vec![
            ChatCompletionRequestMessage::System(system_message),
            ChatCompletionRequestMessage::User(user_message),
        ])
        .n(1)
        .build()?;

    let response = state.ai.chat().create(request).await?;

    let ai_content = response
        .choices
        .first()
        .and_then(|choice| choice.message.content.as_ref())
        .ok_or_else(|| AxumError::new(eyre!("No content generated by AI")))?;

    let ai_quiz: AiQuizResponse = serde_json::from_str(ai_content)
        .map_err(|e| AxumError::new(eyre!("Failed to parse AI response: {}", e)))?;

    let quiz_model = quiz::ActiveModel {
        note_id: Set(id),
        ..Default::default()
    };

    let inserted_quiz = quiz_model.insert(&state.db).await?;

    let mut question_responses = Vec::new();

    for q in ai_quiz.questions {
        let question_model = question::ActiveModel {
            quiz_id: Set(inserted_quiz.id),
            title: Set(q.title.clone()),
            answers: Set(q.answers.clone()),
            correct: Set(q.correct),
            ..Default::default()
        };

        question_model.insert(&state.db).await?;

        question_responses.push(Question {
            title: q.title,
            answers: q.answers,
            correct: q.correct,
        });
    }

    Ok(Json(QuizResponse {
        id: inserted_quiz.id,
        questions: question_responses,
    }))
}
