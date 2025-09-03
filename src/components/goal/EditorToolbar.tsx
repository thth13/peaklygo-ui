import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBold, faItalic, faUnderline, faListUl, faListOl } from '@fortawesome/free-solid-svg-icons';
import { Editor } from '@tiptap/react';

interface EditorToolbarProps {
  editor: Editor | null;
}

export const EditorToolbar = ({ editor }: EditorToolbarProps) => {
  if (!editor) return null;

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-t-lg bg-gray-50 dark:bg-gray-700 p-2 flex gap-1">
      <button
        type="button"
        onClick={() => editor?.chain().focus().toggleBold().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
          editor?.isActive('bold') ? 'bg-gray-300 dark:bg-gray-600' : ''
        }`}
      >
        <FontAwesomeIcon icon={faBold} className="w-4 h-4 text-gray-700 dark:text-gray-300" />
      </button>
      <button
        type="button"
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
          editor?.isActive('italic') ? 'bg-gray-300 dark:bg-gray-600' : ''
        }`}
      >
        <FontAwesomeIcon icon={faItalic} className="w-4 h-4 text-gray-700 dark:text-gray-300" />
      </button>
      <button
        type="button"
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
          editor?.isActive('underline') ? 'bg-gray-300 dark:bg-gray-600' : ''
        }`}
      >
        <FontAwesomeIcon icon={faUnderline} className="w-4 h-4 text-gray-700 dark:text-gray-300" />
      </button>
      <div className="w-px bg-gray-300 dark:bg-gray-600 mx-1"></div>
      <button
        type="button"
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
          editor?.isActive('bulletList') ? 'bg-gray-300 dark:bg-gray-600' : ''
        }`}
      >
        <FontAwesomeIcon icon={faListUl} className="w-4 h-4 text-gray-700 dark:text-gray-300" />
      </button>
      <button
        type="button"
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
          editor?.isActive('orderedList') ? 'bg-gray-300 dark:bg-gray-600' : ''
        }`}
      >
        <FontAwesomeIcon icon={faListOl} className="w-4 h-4 text-gray-700 dark:text-gray-300" />
      </button>
    </div>
  );
};
