import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ImageCrop, ImageCropApply, ImageCropContent, ImageCropReset } from '@/components/ui/image-crop';
import { XIcon } from 'lucide-react';

type Props = {
    onCrop: (arg: string | null) => Promise<void>;
    onCancel: () => void;
    selectedFile: File;
};

export const CropDialog = ({ onCrop, onCancel, selectedFile }: Props) => {
    return (
        <Dialog open>
            <DialogContent>
                <DialogTitle>Crop image</DialogTitle>
                <div className="flex flex-col items-center gap-4">
                    <ImageCrop
                        locked
                        aspect={1}
                        file={selectedFile}
                        maxImageSize={1024 * 1024 * 1}
                        onChange={console.log}
                        onComplete={console.log}
                        onCrop={async (crop) => {
                            await onCrop(crop);
                        }}
                    >
                        <ImageCropContent className="max-w-md" />
                        <div className="flex items-center gap-2">
                            <ImageCropApply />
                            <ImageCropReset />
                            <Button
                                onClick={() => {
                                    onCancel();
                                }}
                                size="icon"
                                type="button"
                                variant="ghost"
                            >
                                <span className="sr-only">Cancel</span>
                                <XIcon className="size-4" />
                            </Button>
                        </div>
                    </ImageCrop>
                </div>
            </DialogContent>
        </Dialog>
    );
};
