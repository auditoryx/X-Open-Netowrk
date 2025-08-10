export interface LeaderboardEntry {
    uid: string;
    name?: string;
    points: number;
}
export interface LeaderboardMap {
    [city: string]: {
        [role: string]: LeaderboardEntry[];
    };
}
export declare function buildLeaderboardData(users: any[]): LeaderboardMap;
export declare const buildLeaderboards: any;
