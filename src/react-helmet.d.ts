declare module 'react-helmet' {
    interface HelmetProps {
        title?: string;
        titleTemplate?: string;
        base?: any;
        link?: Array<any>;
        meta?: Array<any>;
        script?: Array<any>;
        onChangeClientState?: (newState: any) => void;
    }

    interface HelmetData {
        title: HelmetDatum;
        base: HelmetDatum;
        link: HelmetDatum;
        meta: HelmetDatum;
        script: HelmetDatum;
    }

    interface HelmetDatum {
        toString(): string;
        toComponent(): __React.Component<any, any>;
    }

    class Helmet extends __React.Component<HelmetProps, any> {
        static rewind(): HelmetData
    }

    export default Helmet;
}
