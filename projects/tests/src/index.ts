import assert from "assert";
import { describe, it } from "mocha";

import { addParent } from "tailwindcss-theme-variants/selectors";

import { justSelectors } from "./just-selectors";
import { justMediaQueries } from "./just-media-queries";
import { bothSelectorsAndMediaQueries } from "./both-media-queries-and-selectors";
import { atApply } from "./at-apply";
import { warningsAndErrors } from "./warnings-and-errors";
import { semantics } from "./semantics";
import { justSupports } from "./just-supports";

describe("tailwindcss-theme-variants", () => {
	describe("#addParent()", () => {
		it("adds `a` to `b`", () => {
			assert.strictEqual(addParent("a", "b"), "b a");
		});

		it("adds `.parent` to `.child`", () => {
			assert.strictEqual(addParent(".child", ".parent"), ".parent .child");
		});

		it("adds nothing to `.parentless`", () => {
			assert.strictEqual(addParent(".parentless", ""), ".parentless");
		});

		it("adds `#parent` to every `.child{n}`", () => {
			assert.strictEqual(addParent(".child1, .child2, .child3", "#parent"), "#parent .child1, #parent .child2, #parent .child3");
		});

		it("adds `grandparent [parent]` to `child:hover` and `child .grandchild`", () => {
			assert.strictEqual(addParent("child:hover, child .grandchild", "grandparent [parent]"), "grandparent [parent] child:hover, grandparent [parent] child .grandchild");
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
