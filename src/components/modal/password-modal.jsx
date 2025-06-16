import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import copyTextToClipboard from "copy-text-to-clipboard";
import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ({ open = false, hide = () => {}, user = null, label = '', changePassword = false}) {
  const [copied, setCopied] = useState(false);

  const onClose = (o) => {
    if (!o) {
      hide();
    } 
  }

	const handleCopy = () => {
		copyTextToClipboard(user?.password);
		toast.success("Đã sao chép mật khẩu vào clipboard");
    setCopied(true);
	}

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  }, [copied])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{changePassword ? 'Đổi mật khẩu' : 'Tạo'} {label} thành công</DialogTitle>
          <DialogDescription>
            {changePassword ? 'Đổi mật khẩu' : 'Tạo'} {label} {user?.full_name} ({user?.email}) thành công.
						<br />
						Hãy sao chép mật khẩu này và gửi cho {label}.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="password" className="sr-only">
              Mật khẩu
            </Label>
            <Input
              id="password"
              defaultValue={user?.password}
              readOnly
            />
          </div>
          <Button type="submit" size="sm" className="px-3" onClick={handleCopy}>
            <span className="sr-only">Copy</span>
            {!copied && <Copy />}
            {copied && <Check />}
          </Button>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Đóng
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}