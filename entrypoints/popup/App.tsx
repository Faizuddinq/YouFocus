import { useState, useEffect } from "react";
import { storage } from "wxt/storage";

function App() {
	const [isYouFocusMode, setisYouFocusMode] = useState(false);

	useEffect(() => {
		storage.getItem("local:youfocus-mode-status").then((status) => {
			setisYouFocusMode(status === "activated");
		});
	}, []);

	const handleToggle = async () => {
		const newStatus = !isYouFocusMode;
		await storage.setItem(
			"local:youfocus-mode-status",
			newStatus ? "activated" : "not-activated"
		);
		setisYouFocusMode(newStatus);

		// Get all YouTube tabs and reload them
		const youtubeTabs = await browser.tabs.query({
			url: "*://*.youtube.com/*",
		});
		await Promise.all(
			youtubeTabs.map((tab) => tab.id && browser.tabs.reload(tab.id))
		);
	};

	return (
		<div className="min-w-[300px] bg-slate-50 p-8 text-center">
			<h1 className="mb-8 text-2xl font-bold text-slate-800">YouFocus</h1>
			<div className="flex items-center justify-center gap-4">
				<label className="inline-flex items-center cursor-pointer">
					<input
						type="checkbox"
						checked={isYouFocusMode}
						onChange={handleToggle}
						className="sr-only peer"
					/>
					<div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
					<span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
						{isYouFocusMode ? "YouFocus Mode On" : "YouFocus Mode Off"}
					</span>
				</label>
			</div>
		</div>
	);
}

export default App;