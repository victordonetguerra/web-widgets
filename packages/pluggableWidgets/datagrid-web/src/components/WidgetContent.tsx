import classNames from "classnames";
import { CSSProperties, ReactElement, ReactNode, UIEvent, useLayoutEffect, useRef, useState } from "react";

export type WidgetContentProps = {
    className?: string;
    children?: ReactNode;
    style?: CSSProperties;
    showTopScrollbar?: boolean;
};

export function WidgetContent({ children, className, showTopScrollbar = true }: WidgetContentProps): ReactElement {
    const contentRef = useRef<HTMLDivElement>(null);
    const topScrollbarRef = useRef<HTMLDivElement>(null);
    const isSyncingScrollRef = useRef(false);
    const [scrollWidth, setScrollWidth] = useState(1);

    useLayoutEffect(() => {
        const content = contentRef.current;

        if (!content) {
            return;
        }

        const updateTopScrollbar = (): void => {
            setScrollWidth(content.scrollWidth);

            if (topScrollbarRef.current) {
                topScrollbarRef.current.scrollLeft = content.scrollLeft;
            }
        };

        const syncFromContent = (): void => {
            if (!topScrollbarRef.current || isSyncingScrollRef.current) {
                return;
            }

            isSyncingScrollRef.current = true;
            topScrollbarRef.current.scrollLeft = content.scrollLeft;
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
                <div style={{ width: scrollWidth, height: 1 }} />
            </div>

            <div ref={contentRef} className={classNames("widget-datagrid-content", className)}>
                {children}
            </div>
        </>
    );
}
