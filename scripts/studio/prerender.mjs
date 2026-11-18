// Put the first eight route cards in the HTML. The same renderer updates filtered or completed routes.
import { renderRows } from "../../studio/src/app.mjs";
console.log(renderRows("all", new Set()));
