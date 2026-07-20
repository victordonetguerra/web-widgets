import { ReactElement, UIEvent, useLayoutEffect, useRef } from "react";
import { useGridSizeStore } from "../model/hooks/injection-hooks";

export function TopHorizontalScrollbar(props: { showTopScrollbar: boolean }): ReactElement | null {
    const gridSizeStore = useGridSizeStore();

    const topScrollbarRef = useRef<HTMLDivElement>(null);
    const topScrollbarContentRef = useRef<HTMLDivElement>(null);
    const isSyncingScrollRef = useRef(false);

    useLayoutEffect(() => {
        const grid = gridSizeStore.gridContainerRef.current;
        const topScrollbar = topScrollbarRef.current;
        const topScrollbarContent = topScrollbarContentRef.current;

        if (!grid || !topScrollbar || !topScrollbarContent) {
            return;
        }

        const content = grid.closest(".widget-datagrid-content") as HTMLDivElement | null;

        if (!content) {
            return;
        }

        const updateTopScrollbarWidth = (): void => {
            topScrollbarContent.style.width = `${grid.scrollWidth}px`;
            topScrollbar.scrollLeft = content.scrollLeft;
        };

        const syncFromContent = (): void => {
            if (isSyncingScrollRef.current) {
                return;
            }

            isSyncingScrollRef.current = true;
            topScrollbar.scrollLeft = content.scrollLeft;
            isSyncingScrollRef.current = false;
        };

        content.addEventListener("scroll", syncFromContent, { passive: true });

        updateTopScrollbarWidth();

        return () => {
            content.removeEventListener("scroll", syncFromContent);
        };
    }, [gridSizeStore.gridContainerRef]);

    const handleTopScrollbarScroll = (event: UIEvent<HTMLDivElement>): void => {
        const grid = gridSizeStore.gridContainerRef.current;

        if (!grid || isSyncingScrollRef.current) {
            return;
        }

        const content = grid.closest(".widget-datagrid-content") as HTMLDivElement | null;

        if (!content) {
            return;
        }

        isSyncingScrollRef.current = true;
        content.scrollLeft = event.currentTarget.scrollLeft;
        isSyncingScrollRef.current = false;
    };

    return (
        <div
            className="widget-datagrid-top-scrollbar"
            ref={topScrollbarRef}
            onScroll={handleTopScrollbarScroll}
            tabIndex={-1}
            aria-hidden="true"
            role="presentation"
            style={{
                display: props.showTopScrollbar ? "block" : "none",
                width: "100%",
                overflowX: "auto",
                overflowY: "hidden",
                marginBottom: 4,
                userSelect: "none"
            }}
        >
            <div ref={topScrollbarContentRef} style={{ height: 1 }} />
        </div>
    );
}
