export interface article {
    id: number,
    title: string,
    content: string,
    user_id: number
    ///
    /// PIERWSZE DWA-TRZY ZDANIA NOTATKI, PROSZE NIE ZAPOMNI SPARSOWAC DO KROPEK
    ///
    desc?: string,
    author?: string,
    upvotes?: number,
    
    time_ago?: string,
    created_at: string
    upvote?: number,
    saved?: boolean
}