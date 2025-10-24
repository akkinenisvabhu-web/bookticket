declare module "react-qr-scanner" {
  import * as React from "react";

  export interface QrScannerProps {
    delay?: number;
    onError?: (error: any) => void;
    onScan?: (result: { text: string } | null) => void;
    style?: React.CSSProperties;
  }

  export default class QrScanner extends React.Component<QrScannerProps> {}
}
