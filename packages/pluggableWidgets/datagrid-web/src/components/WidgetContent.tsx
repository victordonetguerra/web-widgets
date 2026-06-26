import classNames from "classnames";
import { CSSProperties, ReactElement, ReactNode, UIEvent, useLayoutEffect, useRef } from "react";

export type WidgetContentProps = {
    className?: string;
    children?: ReactNode;
    style?: CSSProperties;
    showTopScrollbar?: boolean;
};

export function WidgetContent({ children, className, showTopScrollbar = true }: WidgetContentProps): ReactElement {
    const contentRef = useRef<HTMLDivElement>(null);
    const topScrollbarRef = useRef<HTMLDivElement>(null);
    const topScrollbarContentRef = useRef<HTMLDivElement>(null);
    const isSyncingScrollRef = useRef(false);

    useLayoutEffect(() => {
        const content = contentRef.current;
        const topScrollbar = topScrollbarRef.current;
        const topScrollbarContent = topScrollbarContentRef.current;

        if (!content || !topScrollbar || !topScrollbarContent) {
            return;
        }

        const updateTopScrollbar = (): void => {
            topScrollbarContent.style.width = `${content.scrollWidth}px`;
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

        const resizeObserver = new ResizeObserver(updateTopScrollbar);
        resizeObserver.observe(content);

        Array.from(content.children).forEach(child => resizeObserver.observe(child));

        content.addEventListener("scroll", syncFromContent, { passive: true });

        updateTopScrollbar();

        return () => {
            content.removeEventListener("scroll", syncFromContent);
            resizeObserver.disconnect();
        };
    }, []);

    const handleTopScrollbarScroll = (event: UIEvent<HTMLDivElement>): void => {
        const content = contentRef.current;

        if (!content || isSyncingScrollRef.current) {
            return;
        }

        isSyncingScrollRef.current = true;
        content.scrollLeft = event.currentTarget.scrollLeft;
        isSyncingScrollRef.current = false;
    };

    return (
        <>
            <div
                className="widget-datagrid-top-scrollbar"
                ref={topScrollbarRef}
                onScroll={handleTopScrollbarScroll}
                style={{
                    display: showTopScrollbar ? "block" : "none",
                    width: "100%",
                    overflowX: "auto",
                    overflowY: "hidden",
                    marginBottom: 4
                }}
            >
                <div ref={topScrollbarContentRef} style={{ height: 1 }} />
            </div>

            <div ref={contentRef} className={classNames("widget-datagrid-content", className)}>
                {children}
            </div>
        </>
    );
}
