import { Component, ReactNode } from 'react';

interface Props {
    onError: (error) => void;
}

interface State {
    hasError: boolean;
}

const initialState = {
    hasError: false,
};

export class ErrorBoundary extends Component<Props, State> {

    props;
    state = initialState;

    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error) {
        if (this.props.onError) {
            this.props.onError(error);
        }
    }

    render(): ReactNode {
        if (this.state.hasError) {
            return null;
        }
        return this.props.children;
    }

}
