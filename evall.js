function evall(expr) {
    if (typeof expr !== 'string') return 0;

    if (expr.includes('^^^')) {
        const parts = expr.split('^^^');

        if (parts.length !== 2) {
            throw new Error('格式錯誤');
        }

        const dividend = Number(parts[0].trim());
        const divisor = Number(parts[1].trim());

        if (isNaN(dividend) || isNaN(divisor)) {
            throw new Error('必須使用有效數字');
        }

        if (divisor === 0) {
            throw new Error('無效除式');
        }

        const quotient =
            divisor > 0
                ? Math.floor(dividend / divisor)
                : Math.ceil(dividend / divisor);

        const remainder =
            ((dividend % divisor) + Math.abs(divisor))
            % Math.abs(divisor);

        return [quotient, remainder];
    }

    let sanitized = expr
        .replace(/(?<!\^)\^(?!\^)/g, '**')
        .replace(/\s+/g, '');

    sanitized = sanitized
        .replace(/\bsin\(/gi, 'sin(')
        .replace(/\bcos\(/gi, 'cos(')
        .replace(/\btan\(/gi, 'tan(')
        .replace(/\bsqrt\(/gi, 'Math.sqrt(')
        .replace(/\blog\(/gi, 'Math.log10(')
        .replace(/\bln\(/gi, 'Math.log(')
        .replace(/\bpi\b/gi, 'Math.PI')
        .replace(/\be\b/gi, 'Math.E');

    const checkResidual = sanitized
        .replace(/\b(sin|cos|tan)\(/gi, '')
        .replace(/Math\.sqrt/g, '')
        .replace(/Math\.log10/g, '')
        .replace(/Math\.log/g, '')
        .replace(/Math\.PI/g, '')
        .replace(/Math\.E/g, '');

    if (/[a-zA-Z]/.test(checkResidual)) {
        throw new Error('包含未知的函數或字元');
    }

    if (!/^[0-9a-zA-Z+\-*/.(),]+$/.test(sanitized)) {
        throw new Error('無效的表達式：包含不合法的字元');
    }

    let balance = 0;

    for (const ch of sanitized) {
        if (ch === '(') balance++;
        if (ch === ')') balance--;

        if (balance < 0) {
            throw new Error('括號不匹配');
        }
    }

    if (balance !== 0) {
        throw new Error('括號不匹配');
    }

    try {
        const result = Function(`
            const sin = x => Math.sin(x * Math.PI / 180);
            const cos = x => Math.cos(x * Math.PI / 180);
            const tan = x => Math.tan(x * Math.PI / 180);

            return (${sanitized});
        `)();

        if (!Number.isFinite(result)) {
            throw new Error();
        }

        return result;
    } catch {
        throw new Error('計算錯誤，請檢查表達式格式');
    }
}

/*
支援以下方式
evall("1+2*3")
evall("(1+2)*3")
evall("2^10")
evall("13^^^5")
evall("sin(30)")
evall("cos(60)")
evall("tan(45)")
evall("sqrt(2025)")
evall("log(1000)")
evall("ln(E)")
evall("PI*2")
evall("sin(cos(60)*30)")
*/