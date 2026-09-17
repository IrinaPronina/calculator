import React from 'react';
import { Image, StyleSheet, Text, View } from '@react-pdf/renderer';
import Logo from './Logo';
import { brandingLines, type Branding } from '@/app/constants/branding';

const styles = StyleSheet.create({
    logo: {
        width: 80,
        height: 80,
        objectFit: 'contain',
    },
    textBlock: {
        flex: 1,
        marginLeft: 10,
        justifyContent: 'center',
    },
    companyName: {
        fontSize: 14,
        fontFamily: 'Roboto',
        fontWeight: 'bold',
        color: '#475569',
        marginBottom: 6,
    },
    companyNameLong: {
        fontSize: 11,
    },
    companyInfo: {
        fontSize: 8,
        fontFamily: 'Roboto',
        color: '#4a5565',
        marginBottom: 3,
        lineHeight: 1.4,
    },
});

const LONG_NAME_CHARS = 40;

type Props = { branding: Branding };

/** Левая часть шапки КП: логотип + текст реквизитов (первая строка — название). */
const PdfCompanyHeader = ({ branding }: Props) => {
    const [name = '', ...rest] = brandingLines(branding);
    return (
        <>
            {branding.logo ? (
                <Image src={branding.logo.dataUrl} style={styles.logo} />
            ) : (
                <Logo />
            )}
            <View style={styles.textBlock}>
                {name ? (
                    <Text
                        style={[
                            styles.companyName,
                            ...(name.length > LONG_NAME_CHARS
                                ? [styles.companyNameLong]
                                : []),
                        ]}>
                        {name}
                    </Text>
                ) : null}
                {rest.map((line, index) => (
                    <Text key={index} style={styles.companyInfo}>
                        {line}
                    </Text>
                ))}
            </View>
        </>
    );
};

export default PdfCompanyHeader;
