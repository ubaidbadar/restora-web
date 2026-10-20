
type ShowState = "active" | "close" | "";

type ShowTools = {
    state: ShowState;
    open: () => void;
    close: () => void;
}

export default ShowTools;
