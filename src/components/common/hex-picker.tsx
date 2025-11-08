'use client';

import {
    ColorArea,
    ColorField,
    ColorPicker,
    ColorSlider,
    ColorSwatch,
    ColorSwatchPicker,
    ColorSwatchPickerItem,
    ColorThumb,
    SliderTrack,
} from '@/components/ui/color';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input, parseColor } from 'react-aria-components';
import { Button } from '../ui/button';

type Props = {
    value: string;
    onChange: (arg: string) => void;
};

export const HexPicker = ({ onChange, value }: Props) => {
    return (
        <ColorPicker value={parseColor(value)} onChange={(color) => onChange(color.toString('hex'))}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button type="button" variant="ghost" className="flex h-fit items-center gap-2 p-1">
                        <ColorSwatch className="size-8 rounded-md border-2" />
                        {value}
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="space-y-4">
                    <div>
                        <ColorArea
                            colorSpace="hsb"
                            xChannel="saturation"
                            yChannel="brightness"
                            className="h-[164px] w-full rounded-b-none border-b-0"
                        >
                            <ColorThumb className="z-50" />
                        </ColorArea>

                        <ColorSlider colorSpace="hsb" channel="hue">
                            <SliderTrack className="w-full rounded-t-none border-t-0">
                                <ColorThumb className="top-1/2" />
                            </SliderTrack>
                        </ColorSlider>
                    </div>

                    <ColorSwatchPicker className="">
                        <ColorSwatchPickerItem color="#4F8EF7">
                            <ColorSwatch />
                        </ColorSwatchPickerItem>
                        <ColorSwatchPickerItem color="#43E97B">
                            <ColorSwatch />
                        </ColorSwatchPickerItem>
                        <ColorSwatchPickerItem color="#F5A623">
                            <ColorSwatch />
                        </ColorSwatchPickerItem>
                        <ColorSwatchPickerItem color="#FF3B30">
                            <ColorSwatch />
                        </ColorSwatchPickerItem>
                        <ColorSwatchPickerItem color="#FFD700">
                            <ColorSwatch />
                        </ColorSwatchPickerItem>
                        <ColorSwatchPickerItem color="#A259F7">
                            <ColorSwatch />
                        </ColorSwatchPickerItem>
                        <ColorSwatchPickerItem color="#00B4D8">
                            <ColorSwatch />
                        </ColorSwatchPickerItem>
                        <ColorSwatchPickerItem color="#F78CA2">
                            <ColorSwatch />
                        </ColorSwatchPickerItem>
                        <ColorSwatchPickerItem color="#FFB6B9">
                            <ColorSwatch />
                        </ColorSwatchPickerItem>
                        <ColorSwatchPickerItem color="#22223B">
                            <ColorSwatch />
                        </ColorSwatchPickerItem>
                        <ColorSwatchPickerItem color="#E6E6EA">
                            <ColorSwatch />
                        </ColorSwatchPickerItem>
                        <ColorSwatchPickerItem color="#2EC4B6">
                            <ColorSwatch />
                        </ColorSwatchPickerItem>
                    </ColorSwatchPicker>
                    <ColorField colorSpace="hsb" className="">
                        <Input />
                    </ColorField>
                </PopoverContent>
            </Popover>
        </ColorPicker>
    );
};
