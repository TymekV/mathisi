import {
    IconButton,
    Surface,
    TouchableRipple,
    TouchableRippleProps,
    Text,
} from 'react-native-paper';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';

export type SheetOptionProps = Omit<TouchableRippleProps, 'children'> & {
    icon: IconSource;
    label: string;
};

export function SheetOption({ icon, label, ...props }: SheetOptionProps) {
    return (
        <TouchableRipple className="rounded-xl overflow-hidden" {...props}>
            <Surface className="p-3 flex-row gap-0.5 items-center" mode="flat" elevation={4}>
                <IconButton icon={icon} />
                <Text>{label}</Text>
            </Surface>
        </TouchableRipple>
    );
}
