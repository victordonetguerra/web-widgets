import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { PropsWithChildren, ReactElement, UIEvent, useLayoutEffect, useRef, useState } from "react";
import { useDatagridConfig, useGridSizeStore, useGridStyle } from "../model/hooks/injection-hooks";
import { useInfiniteControl } from "../model/hooks/useInfiniteControl";

type GridProps = PropsWithChildren<{
    showTopScrollbar: boolean;
}>;

export const Grid = observer(function Grid(props: GridProps): ReactElement {
    const config = useDatagridConfig();
    const gridSizeStore = useGridSizeStore();
    const [handleScroll] = useInfiniteControl();

    const topScrollbarRef = useRef<HTMLDivElement>(null);
    const isSyncingScrollRef = useRef(false);
    const [scrollWidth, setScrollWidth] = useState(1);

    const style = useGridStyle().get();

    const getScrollContainer = (): HTMLDivElement | null => {
        const grid = gridSizeStore.gridContainerRef.current;
        return grid?.closest(".widget-datagrid-content") as HTMLDivElement | null;
    };

    useLayoutEffect(() => {
        const grid = gridSizeStore.gridContainerRef.current;

        if (!grid) {
            return;
        }

        let scrollContainer: HTMLDivElement | null = null;
        let resizeObserver: ResizeObserver | undefined;

        const updateTopScrollbar = (): void => {
            scrollContainer = getScrollContainer();

            if (!scrollContainer) {
                return;
            }

            setScrollWidth(scrollContainer.scrollWidth);

            if (topScrollbarRef.current) {
                topScrollbarRef.current.scrollLeft = scrollContainer.scrollLeft;
            }
        };

        const syncFromGrid = (): void => {
            if (!scrollContainer || !topScrollbarRef.current || isSyncingScrollRef.current) {
                return;
            }

            isSyncingScrollRef.current = true;
            topScrollbarRef.current.scrollLeft = scrollContainer.scrollLeft;
            isSyncingScrollRef.current = false;
        };

        const attach = (): void => {
            scrollContainer = getScrollContainer();

            if (!scrollContainer) {
                requestAnimationFrame(attach);
                return;
            }

            resizeObserver = new ResizeObserver(updateTopScrollbar);
            resizeObserver.observe(grid);
            resizeObserver.observe(scrollContainer);
            Array.from(scrollContainer.children).forEach(child => resizeObserver?.observe(child));

            scrollContainer.addEventListener("scroll", syncFromGrid, { passive: true });
            updateTopScrollbar();
        };

        requestAnimationFrame(attach);

        return () => {
            scrollContainer?.removeEventListener("scroll", syncFromGrid);
            resizeObserver?.disconnect();
        };
    });

    const handleGridScroll = (event: UIEvent<HTMLDivElement>): void => {
        handleScroll?.(event);
    };

    const handleTopScrollbarScroll = (event: UIEvent<HTMLDivElement>): void => {
        const scrollContainer = getScrollContainer();

        if (!scrollContainer || isSyncingScrollRef.current) {
            return;
        }

        isSyncingScrollRef.current = true;
        scrollContainer.scrollLeft = event.currentTarget.scrollLeft;
        isSyncingScrollRef.current = false;
    };

    return (
        <>
            <div
                className="widget-datagrid-top-scrollbar"
                ref={topScrollbarRef}
                onScroll={handleTopScrollbarScroll}
                style={{
                    display: props.showTopScrollbar ? "block" : "none",
                    width: "100%",
                    overflowX: "auto",
                    overflowY: "hidden",
                    height: 8,
                    minHeight: 8,
                    maxHeight: 8,
                    marginBottom: 4
                }}
            >
                <div style={{ width: scrollWidth + 16, height: 1 }} />
            </div>

            <div
                aria-multiselectable={config.multiselectable}
                className={classNames("widget-datagrid-grid table", {
                    "infinite-loading": gridSizeStore.hasVirtualScrolling
                })}
                role="grid"
                style={style}
                ref={gridSizeStore.gridContainerRef}
                onScroll={handleGridScroll}
            >
                {props.children}
            </div>
        </>
    );
});
