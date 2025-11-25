import { useMemo } from 'react';
import { Platform, StyleSheet, View, ViewProps } from 'react-native';
import ActionSheet, { ActionSheetProps } from 'react-native-actions-sheet';
import { useTheme } from 'react-native-paper';

export interface StyledActionSheetProps extends ActionSheetProps {
    fullHeight?: boolean;
}

export function StyledActionSheet({ fullHeight, children, ...props }: StyledActionSheetProps) {
    const theme = useTheme();

    return (
        <ActionSheet
            containerStyle={{
                borderTopLeftRadius: 25,
                borderTopRightRadius: 25,
                backgroundColor: theme.colors.elevation.level1,
                ...(fullHeight ? { flex: 1 } : {}),
            }}
            indicatorStyle={{
                width: 50,
                height: 5,
                borderRadius: 5,
                backgroundColor: theme.colors.elevation.level5,
                marginTop: 10,
            }}
            {...props}
        >
            {children}
        </ActionSheet>
    );
}

export function SheetContainer({ children, style, ...props }: ViewProps) {
    const styles = useMemo(
        () =>
            StyleSheet.create({
                container: {
                    padding: 15,
                    paddingTop: 5,
                    paddingBottom: Platform.OS === 'ios' ? 0 : 15,
                    paddingHorizontal: 25,
                    // flex: 1,
                },
            }),
        []
    );

    return (
        <View style={[styles.container, style]} {...props}>
            {children}
        </View>
    );
}
