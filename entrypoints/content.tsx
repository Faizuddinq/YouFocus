import ReactDOM, { Root } from "react-dom/client";
import Search from "@/components/Search";
import { ContentScriptContext, ShadowRootContentScriptUi } from "wxt/client";
import { storage } from "wxt/storage";

const whereToShowCustomUI = [new MatchPattern("*://*.youtube.com/")];

let uiRef: ShadowRootContentScriptUi<Root> | null = null;

export default defineContentScript({
	matches: ["*://*.youtube.com/*"],
	cssInjectionMode: "ui",
	runAt: "document_end",
	async main(ctx) {
		console.log("Hello content.");
		const youfocusModeStatus = await storage.getItem("local:youfocus-mode-status", {
			fallback: "not-activated",
		});

		if (youfocusModeStatus === "activated") {
			document.documentElement.style.setProperty(
				"--youfocus-mode-status",
				"activated"
			);

			ctx.addEventListener(window, "wxt:locationchange", async ({ newUrl }) => {
				if (!uiRef && checkIfWeCanInjectUI(newUrl.toString())) {
					await mountShadowRootUi(ctx);
				}
			});

			if (checkIfWeCanInjectUI(window.location.href)) {
				await mountShadowRootUi(ctx);
			}
		} else {
			document.documentElement.style.setProperty(
				"--youfocus-mode-status",
				"not-activated"
			);
		}
	},
});

async function mountShadowRootUi(ctx: ContentScriptContext) {
	uiRef = await createShadowRootUi(ctx, {
		name: "youfocus-ui",
		position: "inline",
		anchor: "body",
		onMount: (container) => {
			// Container is a body, and React warns when creating a root on the body, so create a wrapper div
			const app = document.createElement("div");
			container.append(app);

			// Create a root on the UI container and render a component
			const root = ReactDOM.createRoot(app);
			root.render(<Search />);
			return root;
		},
		onRemove: (root) => {
			// Unmount the root when the UI is removed
			root?.unmount();
		},
	});

	// Call mount to add the UI to the DOM
	uiRef?.mount();
}

function checkIfWeCanInjectUI(newUrl: string) {
	return whereToShowCustomUI.some((pattern) => pattern.includes(newUrl));
}