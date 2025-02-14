
export interface Review {
    id: string;
    user: {
        name: string;
        avatar: string;
        role: string;
    };
    rating: number;
    comment: string;
    date: string;
}

export interface AgentMetric {
    label: string;
    value: string;
    change: number;
    timeframe: string;
}
