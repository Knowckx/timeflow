/**
 * TimeFlow 导出工具函数
 */

import type { Task } from '$lib/types/task';
import { formatDate, formatTime, calculateDuration } from './time';

/**
 * 将任务列表导出为 Markdown 格式
 */
export function exportToMarkdown(tasks: Task[], date: Date = new Date()): string {
    const todayTasks = tasks.filter(task => {
        const taskDate = task.startTime;
        return (
            taskDate.getFullYear() === date.getFullYear() &&
            taskDate.getMonth() === date.getMonth() &&
            taskDate.getDate() === date.getDate()
        );
    });

    if (todayTasks.length === 0) {
        return `# ${formatDate(date)}\n\n_今天还没有记录任务_`;
    }

    const lines: string[] = [];

    // 标题
    lines.push(`# ${formatDate(date)}`);
    lines.push('');
    lines.push('## 🚀 工作记录');
    lines.push('');

    // 按开始时间排序
    const sortedTasks = [...todayTasks].sort(
        (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );

    for (const task of sortedTasks) {
        const startTime = formatTime(task.startTime, { showSeconds: false });
        const checkbox = task.completed ? '[x]' : '[ ]';

        if (task.completed && task.endTime) {
            const endTime = formatTime(task.endTime, { showSeconds: false });
            const duration = formatDurationShort(task.startTime, task.endTime);
            lines.push(`- ${checkbox} ${startTime} - ${endTime} | ${task.title} (用时 ${duration})`);
        } else {
            lines.push(`- ${checkbox} ${startTime} | ${task.title} (进行中...)`);
        }

        // 添加 Checkpoints
        if (task.checkpoints.length > 0) {
            for (const cp of task.checkpoints) {
                const cpTime = formatTime(cp.time, { showSeconds: false });
                lines.push(`    > ${cpTime} - ${cp.note}`);
            }
        }
    }

    // 统计信息
    lines.push('');
    lines.push('---');
    lines.push('');

    const completedCount = todayTasks.filter(t => t.completed).length;
    const totalCount = todayTasks.length;
    lines.push(`📊 **统计**: 完成 ${completedCount}/${totalCount} 个任务`);

    // 计算总用时
    const totalMs = todayTasks
        .filter(t => t.completed && t.endTime)
        .reduce((sum, t) => sum + (t.endTime!.getTime() - t.startTime.getTime()), 0);

    if (totalMs > 0) {
        const hours = Math.floor(totalMs / (1000 * 60 * 60));
        const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
        const parts: string[] = [];
        if (hours > 0) parts.push(`${hours}小时`);
        if (minutes > 0) parts.push(`${minutes}分钟`);
        lines.push(`⏱️ **总用时**: ${parts.join('') || '0分钟'}`);
    }

    return lines.join('\n');
}

/**
 * 格式化持续时间为简短格式
 * @returns 如 "1h30m" 或 "45m"
 */
function formatDurationShort(start: Date, end: Date): string {
    const diffMs = end.getTime() - start.getTime();

    if (diffMs < 0) return '0m';

    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    const parts: string[] = [];
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0 || hours === 0) parts.push(`${minutes}m`);

    return parts.join('');
}

/**
 * 复制文本到剪贴板
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        // 降级方案
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            return true;
        } catch {
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

/**
 * 下载文本为文件
 */
export function downloadAsFile(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
