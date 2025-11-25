import { TextInput, TextInputProps, View } from 'react-native';
import { Surface, useTheme } from 'react-native-paper';

export interface SimpleInputProps extends TextInputProps {
    side?: 'top' | 'bottom';
    containerStyle?: View['props']['style'];
    elevation?: 0 | 1 | 2 | 3 | 4 | 5;
}

export function SimpleInput({
    side = 'top',
    elevation = 1,
    containerStyle,
    style,
    ...props
}: SimpleInputProps) {
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
                    justifyContent: props.multiline ? undefined : 'center',
                },
                containerStyle,
            ]}
            mode="flat"
            elevation={elevation}
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
                        paddingHorizontal: 14,
                        flex: props.multiline ? 1 : undefined,
                    },
                    style,
                ]}
            />
        </Surface>
    );
}
