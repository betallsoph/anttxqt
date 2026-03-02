import { Compass } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function AdminExplorePage() {
    return (
        <Card>
            <CardContent className="py-12 text-center space-y-4">
                <Compass className="w-12 h-12 mx-auto text-zinc-300" />
                <h2 className="text-lg font-bold text-zinc-400">Explore Editor</h2>
                <p className="text-sm text-zinc-400">Coming soon. Explore page chưa có nội dung để chỉnh sửa.</p>
            </CardContent>
        </Card>
    );
}
