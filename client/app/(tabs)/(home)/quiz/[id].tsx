import QuestionTab from '@/components/quiz/question-tab';
import { apiClient } from '@/lib/providers/api';
import type { components } from '@/types/api';
import { useLocalSearchParams } from 'expo-router';

type Note = components['schemas']['NoteResponse'];

export default function NoteDetailsScreen() {
    const params = useLocalSearchParams<{ id?: string | string[] }>();
    const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
    const numericId = rawId ? Number(rawId) : Number.NaN;

    const queryEnabled = Number.isFinite(numericId);
    const noteQuery = apiClient.useQuery(
        'get',
        '/api/notes/{id}',
        { params: { path: { id: queryEnabled ? numericId : 0 } } },
        {
            enabled: queryEnabled,
        }
    );

    return (
        <QuestionTab  />
    );
}


