'use client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useBlogCommentsSheet } from '@/lib/hooks/use-blog-comments-sheet';

export const SelectSorting = () => {
    const { sorting, setSorting } = useBlogCommentsSheet();

    return (
        <Select onValueChange={(val) => setSorting(val as typeof sorting)} value={sorting}>
            <SelectTrigger className="mx-6 border bg-transparent dark:bg-transparent">
                <SelectValue className="bg-transparent" />
            </SelectTrigger>
            <SelectContent>
                {['featured', 'latest', 'oldest'].map((elem) => (
                    <SelectItem key={elem} value={elem}>
                        {elem}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
