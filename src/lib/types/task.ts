/**
 * TimeFlow Core Types
 * 核心数据类型定义
 */

/** Checkpoint - 任务中间记录点 */
export interface Checkpoint {
    id: string;
    time: Date;
    note: string;
}

/** Task - 任务 */
export interface Task {
    id: string;
    title: string;
    startTime: Date;
    endTime?: Date;
    completed: boolean;
    checkpoints: Checkpoint[];
}

/** 用于创建新任务的输入类型 */
export type NewTaskInput = Pick<Task, 'title'>;

/** 用于创建新 Checkpoint 的输入类型 */
export type NewCheckpointInput = Pick<Checkpoint, 'note'>;

/** 时间格式化选项 */
export interface TimeFormatOptions {
    showSeconds?: boolean;
    use24Hour?: boolean;
}
