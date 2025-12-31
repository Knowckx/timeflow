/**
 * TimeFlow Task Store
 * 使用 Svelte 5 runes 管理任务状态
 */

import type { Task, Checkpoint, NewTaskInput, NewCheckpointInput } from '$lib/types/task';

const STORAGE_KEY = 'timeflow_tasks';

/** 生成唯一 ID */
function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

/** 从 localStorage 加载任务 */
function loadTasks(): Task[] {
    if (typeof window === 'undefined') return [];

    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return [];

        const parsed = JSON.parse(stored);
        // 恢复 Date 对象
        return parsed.map((task: Task) => ({
            ...task,
            startTime: new Date(task.startTime),
            endTime: task.endTime ? new Date(task.endTime) : undefined,
            checkpoints: task.checkpoints.map((cp: Checkpoint) => ({
                ...cp,
                time: new Date(cp.time)
            }))
        }));
    } catch {
        return [];
    }
}

/** 保存任务到 localStorage */
function saveTasks(tasks: Task[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

/** 创建任务状态管理器 */
function createTaskStore() {
    let tasks = $state<Task[]>([]);
    let initialized = $state(false);
    let selectedDate = $state<Date>(new Date());

    return {
        /** 获取所有任务 */
        get tasks() {
            return tasks;
        },

        /** 是否已初始化 */
        get initialized() {
            return initialized;
        },

        /** 获取当前选中的日期 */
        get selectedDate() {
            return selectedDate;
        },

        /** 初始化（从 localStorage 加载） */
        init() {
            if (initialized) return;
            tasks = loadTasks();
            selectedDate = new Date(); // 每次初始化重置到今天
            initialized = true;
        },

        /** 设置选中日期 */
        setSelectedDate(date: Date) {
            selectedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        },

        /** 切换到前一天 */
        goToPreviousDay() {
            const prev = new Date(selectedDate);
            prev.setDate(prev.getDate() - 1);
            selectedDate = prev;
        },

        /** 切换到后一天 */
        goToNextDay() {
            const next = new Date(selectedDate);
            next.setDate(next.getDate() + 1);
            selectedDate = next;
        },

        /** 重置到今天 */
        resetToToday() {
            const today = new Date();
            selectedDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        },

        /** 添加新任务 */
        addTask(input: NewTaskInput): Task {
            const newTask: Task = {
                id: generateId(),
                title: input.title,
                startTime: new Date(),
                completed: false,
                checkpoints: []
            };

            tasks = [newTask, ...tasks];
            saveTasks(tasks);
            return newTask;
        },

        /** 标记任务完成 */
        completeTask(taskId: string): void {
            tasks = tasks.map(task => {
                if (task.id !== taskId) return task;
                return {
                    ...task,
                    completed: true,
                    endTime: new Date()
                };
            });
            saveTasks(tasks);
        },

        /** 取消完成任务 */
        uncompleteTask(taskId: string): void {
            tasks = tasks.map(task => {
                if (task.id !== taskId) return task;
                return {
                    ...task,
                    completed: false,
                    endTime: undefined
                };
            });
            saveTasks(tasks);
        },

        /** 添加 Checkpoint */
        addCheckpoint(taskId: string, input: NewCheckpointInput): Checkpoint | null {
            const newCheckpoint: Checkpoint = {
                id: generateId(),
                time: new Date(),
                note: input.note
            };

            let added = false;
            tasks = tasks.map(task => {
                if (task.id !== taskId) return task;
                added = true;
                return {
                    ...task,
                    checkpoints: [...task.checkpoints, newCheckpoint]
                };
            });

            if (added) {
                saveTasks(tasks);
                return newCheckpoint;
            }
            return null;
        },

        /** 删除任务 */
        deleteTask(taskId: string): void {
            tasks = tasks.filter(task => task.id !== taskId);
            saveTasks(tasks);
        },

        /** 删除 Checkpoint */
        deleteCheckpoint(taskId: string, checkpointId: string): void {
            tasks = tasks.map(task => {
                if (task.id !== taskId) return task;
                return {
                    ...task,
                    checkpoints: task.checkpoints.filter(cp => cp.id !== checkpointId)
                };
            });
            saveTasks(tasks);
        }
    };
}

/** 全局任务 store 实例 */
export const taskStore = createTaskStore();
