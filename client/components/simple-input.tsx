import { TextInput, TextInputProps, View } from 'react-native';
import { Surface, useTheme } from 'react-native-paper';

export interface SimpleInputProps extends TextInputProps {
    side?: 'top' | 'bottom';
    containerStyle?: View['props']['style'];
}

export function SimpleInput({ side = 'top', containerStyle, style, ...props }: SimpleInputProps) {
    const theme = useTheme();

    return (
        <Surface
            style={[
                {
                    borderTopLeftRadius: side === 'top' ? 16 : 6,
                    borderTopRightRadius: side === 'top' ? 16 : 6,
                    borderBottomLeftRadius: side === 'top' ? 6 : 16,
                    borderBottomRightRadius: side === 'top' ? 6 : 16,
                    paddingVertical: 0,
                    justifyContent: 'center',
                },
                containerStyle,
            ]}
            mode="flat"
        >
            <TextInput
                {...props}
                multiline
                scrollEnabled
                textAlignVertical="top"
                className="text-lg"
                style={[
                    {
                        color: theme.colors.onBackground,
                        paddingHorizontal: 12,
                    },
                    style,
                ]}
            />
        </Surface>
    );
}
