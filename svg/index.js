const fs = require('fs');
const readline = require('readline');
const { JSDOM } = require('jsdom');

// SVG dosyasının yolunu belirleyin
const svgFilePath = 'prami-pink.svg';

// Readline arayüzünü oluştur
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Kullanıcıdan `g24` için yeni fill rengini sor
rl.question('Prami gövde rengi: ', (fillColorG24) => {
    fillColorG24 = formatColor(fillColorG24);

    // Kullanıcıdan `g48` ve `g52` için aynı fill rengini sor
    rl.question('Prami yanak rengi: ', (fillColorG48_G52) => {
        fillColorG48_G52 = formatColor(fillColorG48_G52);

        // Kullanıcıdan `g32`, `g40`, `g28`, `g36`, ve `g56` için aynı rengi sor
        rl.question('Prami göz ve ağız rengi: ', (colorG32_G40_G28_G36_G56) => {
            colorG32_G40_G28_G36_G56 = formatColor(colorG32_G40_G28_G36_G56);

            // Yeni dosya adını sor ve `prami-` ön ekini ekleyerek kaydet
            rl.question('Prami SVG dosyasının adı: ', (newFileName) => {
                const finalFileName = `prami-${newFileName}.svg`;

                // SVG dosyasını oku
                fs.readFile(svgFilePath, 'utf8', (err, data) => {
                    if (err) {
                        console.error('SVG dosyası okunamadı:', err);
                        rl.close();
                        return;
                    }

                    // SVG içeriğini JSDOM kullanarak parse et
                    const dom = new JSDOM(data, { contentType: 'image/svg+xml' });
                    const document = dom.window.document;

                    // Belirtilen id'ye sahip `g` öğesinin fill/stroke rengini güncelleme işlevi
                    const updateColor = (gElementId, attribute, color) => {
                        const gElement = document.getElementById(gElementId);
                        if (gElement) {
                            const pathElement = gElement.querySelector('path');
                            if (pathElement) {
                                // Belirtilen attribute'ü var mı kontrol et ve değiştir
                                if (pathElement.hasAttribute(attribute)) {
                                    pathElement.setAttribute(attribute, color);
                                }

                                // 'style' attribute'ü içindeki fill/stroke değerini değiştir
                                const style = pathElement.getAttribute('style');
                                if (style) {
                                    const updatedStyle = style.replace(new RegExp(`${attribute}:[^;]+`), `${attribute}:${color}`);
                                    pathElement.setAttribute('style', updatedStyle);
                                }
                            } else {
                                console.error(`${gElementId} öğesi içinde path bulunamadı.`);
                            }
                        } else {
                            console.error(`${gElementId} id'sine sahip bir g öğesi bulunamadı.`);
                        }
                    };

                    // g24 için fill rengini güncelle
                    updateColor('g24', 'fill', fillColorG24);

                    // g48 ve g52 için fill rengini güncelle
                    updateColor('g48', 'fill', fillColorG48_G52);
                    updateColor('g52', 'fill', fillColorG48_G52);

                    // g32, g56 ve g40 için stroke rengini güncelle
                    updateColor('g32', 'stroke', colorG32_G40_G28_G36_G56);
                    updateColor('g40', 'stroke', colorG32_G40_G28_G36_G56);
                    updateColor('g56', 'stroke', colorG32_G40_G28_G36_G56);

                    // g28 ve g36 için fill rengini güncelle
                    updateColor('g28', 'fill', colorG32_G40_G28_G36_G56);
                    updateColor('g36', 'fill', colorG32_G40_G28_G36_G56);

                    // Güncellenen SVG içeriğini al
                    const updatedSVG = document.documentElement.outerHTML;

                    // Yeni SVG dosyasını kaydet
                    fs.writeFile(finalFileName, updatedSVG, 'utf8', (err) => {
                        if (err) {
                            console.error('SVG dosyası kaydedilemedi:', err);
                        } else {
                            console.log(`SVG dosyası başarıyla ${finalFileName} olarak kaydedildi!`);
                        }
                        rl.close();
                    });
                });
            });
        });
    });
});

// Renk değerini formatlama işlevi (başında # yoksa ekler)
function formatColor(color) {
    if (!color.startsWith('#')) {
        return `#${color}`;
    }
    return color;
}