import assert from "assert";
import { describe, it } from "mocha";

import { distill, addParent } from "tailwindcss-theme-variants/selectors";

import { justSelectors } from "./just-selectors";
import { justMediaQueries } from "./just-media-queries";
import { bothSelectorsAndMediaQueries } from "./both-media-queries-and-selectors";
import { atApply } from "./at-apply";
import { warningsAndErrors } from "./warnings-and-errors";
import { semantics } from "./semantics";
import { justSupports } from "./just-supports";

describe("tailwindcss-theme-variants", () => {
	describe("#distill()", () => {
		it("gives ['html', ['.theme-light', '.theme-dark']] for ['html.theme-light', 'html.theme-dark']", () => {
			assert.deepEqual(distill(["html.theme-light", "html.theme-dark"]), ["html", [".theme-light", ".theme-dark"]]);
		});

		it("gives ['html.theme', ['.light', '.dark']] for ['html.theme.light', 'html.theme.dark']", () => {
			assert.deepEqual(distill(["html.theme.light", "html.theme.dark"]), ["html.theme", [".light", ".dark"]]);
		});

		it("gives ['body', ['[data-theme=light]', '[data-theme=dark]']] for ['body[data-theme=light]', 'body[data-theme=dark]']", () => {
			assert.deepEqual(distill(["body[data-theme=light]", "body[data-theme=dark]"]), ["body", ["[data-theme=light]", "[data-theme=dark]"]]);
		});
	});

	describe("#addParent()", () => {
		it("adds `a` to `b`", () => {
			assert.equal(addParent("a", "b"), "b a");
		});

		it("adds `.parent` to `.child`", () => {
			assert.equal(addParent(".child", ".parent"), ".parent .child");
		});

		it("adds nothing to `.parentless`", () => {
			assert.equal(addParent(".parentless", ""), ".parentless");
		});

		it("adds `#parent` to every `.child{n}`", () => {
			assert.equal(addParent(".child1, .child2, .child3", "#parent"), "#parent .child1, #parent .child2, #parent .child3");
		});

		it("adds `grandparent [parent]` to `child:hover` and `child .grandchild`", () => {
			assert.equal(addParent("child:hover, child .grandchild", "grandparent [parent]"), "grandparent [parent] child:hover, grandparent [parent] child .grandchild");
		});
	});

	describe("#thisPlugin()", () => {
		justSelectors();
		justMediaQueries();
		justSupports();
		bothSelectorsAndMediaQueries();
		atApply();
		warningsAndErrors();
		semantics();
	});
});
