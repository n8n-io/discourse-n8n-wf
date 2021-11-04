import Component from "@ember/component";
import { bufferedProperty } from "discourse/mixins/buffered-content";

const DiscourseN8nWfComponent = Component.extend(bufferedProperty("model"), {
    tagName: "div",
});

export default DiscourseN8nWfComponent;

