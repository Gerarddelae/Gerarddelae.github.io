import { visit } from 'unist-util-visit';

export function remarkReadingTime() {
  return function (tree, { data }) {
    let text = '';
    visit(tree, 'text', (node) => {
      text += node.value;
    });
    const wordCount = text.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);
    data.astro.frontmatter.minutesRead = `${readingTime} min read`;
  };
}
