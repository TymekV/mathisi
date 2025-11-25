import React from 'react';
import { StyleSheet, TextStyle, View } from 'react-native';
import { Appbar, useTheme } from 'react-native-paper';
import { getHeaderTitle } from '@react-navigation/elements';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type PaperAppbarHeaderProps = {
    navigation: {
        goBack: () => void;
    } & Record<string, any>;
    route: { name: string } & Record<string, any>;
    options: Record<string, any>;
    back?: Record<string, any>;
    insets?: { top?: number };
};

export default function PaperAppbarHeader(props: PaperAppbarHeaderProps) {
    const { navigation, options, route } = props;
    const back = 'back' in props ? props.back : undefined;
    const navigationInsets = (props as { insets?: { top?: number } }).insets;
    const safeAreaInsets = useSafeAreaInsets();
    const theme = useTheme();
    const title = getHeaderTitle(options, route.name);
    const tintColor = options.headerTintColor ?? theme.colors.onSurface;
    const canGoBack = Boolean(back);
    const topInset = navigationInsets?.top ?? safeAreaInsets.top ?? 0;

    const headerLeft = options.headerLeft
        ? options.headerLeft({ tintColor, canGoBack })
        : canGoBack && (options as any).headerBackVisible !== false
          ? (
                <Appbar.BackAction color={tintColor} onPress={navigation.goBack} />
            )
          : null;

    const headerRight = options.headerRight?.({ tintColor, canGoBack });
    const mode: 'small' | 'center-aligned' = options.headerTitleAlign === 'center' ? 'center-aligned' : 'small';
    const statusBarHeight = (options as any).headerStatusBarHeight ?? topInset;
    const isTransparent = options.headerTransparent === true;
    const titleStyle = StyleSheet.flatten([
        styles.title,
        { color: tintColor },
        options.headerTitleStyle,
    ]) as TextStyle;

    return (
        <Appbar.Header
            statusBarHeight={statusBarHeight}
            mode={mode}
            elevated={!isTransparent && options.headerShadowVisible !== false}
            style={[isTransparent && styles.transparentBackground, options.headerStyle]}
        >
            {headerLeft}
            <Appbar.Content
                title={title}
                titleStyle={titleStyle}
                style={options.headerTitleAlign === 'center' ? styles.centeredContent : undefined}
            />
            {headerRight ? <View style={styles.trailing}>{headerRight}</View> : null}
        </Appbar.Header>
    );
}

const styles = StyleSheet.create({
    transparentBackground: {
        backgroundColor: 'transparent',
        elevation: 0,
        shadowOpacity: 0,
    },
    title: {
        fontWeight: '600',
    },
    centeredContent: {
        alignItems: 'center',
    },
    trailing: {
        marginRight: 4,
    },
});
