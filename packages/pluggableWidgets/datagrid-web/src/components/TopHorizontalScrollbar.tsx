import { ReactElement, useLayoutEffect, useRef } from "react";
import { useGridSizeStore } from "../model/hooks/injection-hooks";

export function TopHorizontalScrollbar(): ReactElement {
    const gridSizeStore = useGridSizeStore();
    const topScrollbarRef = useRef<HTMLDivElement>(null);
    const topScrollbarContentRef = useRef<HTMLDivElement>(null);
    const isSyncingRef = useRef(false);

    useLayoutEffect(() => {
        const grid = gridSizeStore.gridContainerRef.current;
        const topScrollbar = topScrollbarRef.current;
        const topScrollbarContent = topScrollbarContentRef.current;

        if (!grid || !topScrollbar || !topScrollbarContent) {
            return;
        }

        const updateScrollbarWidth = (): void => {
            topScrollbarContent.style.width = `${grid.scrollWidth}px`;
            topScrollbar.style.display = grid.scrollWidth > grid.clientWidth ? "block" : "none";
            topScrollbar.scrollLeft = grid.scrollLeft;
        };

        const syncFromTop = (): void => {
            if (isSyncingRef.current) {
                return;
            }

            isSyncingRef.current = true;
            grid.scrollLeft = topScrollbar.scrollLeft;
            isSyncingRef.current = false;
        };

        const syncFromGrid = (): void => {
            if (isSyncingRef.current) {
                return;
            }

            isSyncingRef.current = true;
            topScrollbar.scrollLeft = grid.scrollLeft;
            isSyncingRef.current = false;
        };

        const resizeObserver = new ResizeObserver(updateScrollbarWidth);
        resizeObserver.observe(grid);

        Array.from(grid.children).forEach(child => resizeObserver.observe(child));

        const mutationObserver = new MutationObserver(() => {
            Array.from(grid.children).forEach(child => resizeObserver.observe(child));
            updateScrollbarWidth();
        });

        mutationObserver.observe(grid, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["style", "class"]
        });

        topScrollbar.addEventListener("scroll", syncFromTop, { passive: true });
        grid.addEventListener("scroll", syncFromGrid, { passive: true });

        updateScrollbarWidth();

        return () => {
            topScrollbar.removeEventListener("scroll", syncFromTop);
            grid.removeEventListener("scroll", syncFromGrid);
            resizeObserver.disconnect();
            mutationObserver.disconnect();
        };
    }, [gridSizeStore.gridContainerRef]);

    return (
        <div
            className="widget-datagrid-top-scrollbar"
            ref={topScrollbarRef}
            style={{
                overflowX: "auto",
                overflowY: "hidden",
                height: 12,
                minHeight: 12,
                maxHeight: 12
            }}
        >
            <div
                ref={topScrollbarContentRef}
                style={{
                    height: 1
                }}
            />
        </div>
    );
}
