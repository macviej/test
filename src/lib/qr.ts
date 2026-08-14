import QRCode from "qrcode";

export async function buildQrDataUrl(value: string) {
  return QRCode.toDataURL(value, {
    errorCorrectionLevel: "M",
    margin: 1,
    width: 480,
    color: {
      dark: "#000000",
      light: "#FFFFFF",
    },
  });
}
