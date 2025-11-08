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
import { Input, Label, parseColor } from 'react-aria-components';
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

                <PopoverContent>
                    <div>
                        <ColorArea colorSpace="hsb" xChannel="saturation" yChannel="brightness" className="h-[164px] rounded-b-none border-b-0">
                            <ColorThumb className="z-50" />
                        </ColorArea>
                        <ColorSlider colorSpace="hsb" channel="hue">
                            <SliderTrack className="rounded-t-none border-t-0">
                                <ColorThumb className="top-1/2" />
                            </SliderTrack>
                        </ColorSlider>
                    </div>

                    <ColorField colorSpace="hsb" className="w-48">
                        <Label>Hex</Label>
                        <Input />
                    </ColorField>

                    <ColorSwatchPicker className="w-48">
                        <ColorSwatchPickerItem color="#F00">
                            <ColorSwatch />
                        </ColorSwatchPickerItem>
                        <ColorSwatchPickerItem color="#f90">
                            <ColorSwatch />
                        </ColorSwatchPickerItem>
                        <ColorSwatchPickerItem color="#0F0">
                            <ColorSwatch />
                        </ColorSwatchPickerItem>
                        <ColorSwatchPickerItem color="#08f">
                            <ColorSwatch />
                        </ColorSwatchPickerItem>
                        <ColorSwatchPickerItem color="#00f">
                            <ColorSwatch />
                        </ColorSwatchPickerItem>
                    </ColorSwatchPicker>
                </PopoverContent>
            </Popover>
        </ColorPicker>
    );
};
