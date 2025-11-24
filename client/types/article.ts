export interface article {
    id: number,
    title: string,
    content: string,
    ///
    /// PIERWSZE DWA-TRZY ZDANIA NOTATKI, PROSZE NIE ZAPOMNI SPARSOWAC DO KROPEK
    ///
    desc?: string,
    author?: string,
    upvotes?: number,
    
    time_ago?: string,
    upvote?: number,
    saved?: boolean
}