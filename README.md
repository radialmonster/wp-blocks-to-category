# WP Blocks to Category

A WordPress plugin that automatically assigns categories to posts based on the blocks they contain. Configure block-to-category mappings and let the plugin handle category management automatically.

## Features

- **Automatic Category Assignment**: Posts are automatically assigned categories based on their block content
- **Multi-Category Support**: Assign multiple categories to each block type
- **Additive Approach**: Preserves existing categories while adding new ones
- **Block Detection**: Works with all registered WordPress blocks
- **Optional Category Removal**: Toggle whether categories should be removed when blocks are removed from posts
- **Easy-to-Use Interface**: Simple settings page under WordPress Settings menu
- **Search & Filter**: Quickly find blocks in the settings interface
- **Real-time Updates**: Categories are assigned when posts are created or updated

## Installation

### Manual Installation

1. Download or clone this repository
2. Upload the `wp-blocks-to-category` folder to your `/wp-content/plugins/` directory
3. Activate the plugin through the 'Plugins' menu in WordPress
4. Navigate to **Settings > WP Blocks to Category** to configure

### Via WP-CLI

```bash
wp plugin install wp-blocks-to-category --activate
```

## Usage

### Configure Block Mappings

1. Go to **Settings > WP Blocks to Category** in your WordPress admin
2. You'll see a list of all registered blocks in your WordPress installation
3. For each block, select one or more categories you want to assign
4. Use the search box to quickly find specific blocks
5. Click **Save Settings** to save your configuration

### General Settings

**Remove Categories on Block Removal**: Enable this option if you want the plugin to automatically remove categories when a block is removed from a post. When disabled, categories remain even after blocks are removed.

### How It Works

1. **Configure**: Set up block-to-category mappings in the settings page
2. **Create/Edit Posts**: When you save a post, the plugin scans for blocks
3. **Auto-Assign**: Categories are automatically assigned based on detected blocks
4. **Preserve**: Existing categories are kept (categories are added, not replaced)
5. **Optional Removal**: If enabled, categories are removed when blocks are removed

## Examples

### Example 1: Gallery Block
- Assign "Photos" and "Media" categories to the `core/gallery` block
- Any post containing a gallery block will automatically get both categories
- The post keeps any other categories it already had

### Example 2: Quote Block
- Assign "Quotes" category to the `core/quote` block
- Posts with quote blocks automatically get the "Quotes" category
- If the quote block is removed and category removal is enabled, "Quotes" is removed

## Requirements

- WordPress 5.8 or higher
- PHP 7.4 or higher
- Block Editor (Gutenberg) enabled

## File Structure

```
wp-blocks-to-category/
├── assets/
│   ├── css/
│   │   └── admin.css          # Admin styling
│   └── js/
│       └── admin.js           # Admin JavaScript
├── includes/
│   └── admin-page.php         # Settings page template
├── wp-blocks-to-category.php  # Main plugin file
└── README.md                  # Documentation
```

## Technical Details

### WordPress Hooks Used

- `admin_menu`: Registers the settings page
- `admin_init`: Registers plugin settings
- `save_post`: Detects blocks and assigns categories
- `admin_enqueue_scripts`: Loads admin assets
- `wp_ajax_wpbtc_save_mappings`: AJAX handler for saving settings

### Data Storage

- **Block Mappings**: Stored in `wp_options` table as `wpbtc_block_category_mappings`
- **Settings**: Stored in `wp_options` table as `wpbtc_settings`

### Block Detection

The plugin uses WordPress's `parse_blocks()` function to parse post content and extract block names. It recursively checks for inner blocks to ensure all blocks are detected.

### Category Assignment Logic

1. Parse post content to extract all block names
2. Look up configured categories for each detected block
3. Merge with existing post categories (preserving all existing categories)
4. If removal is enabled, remove categories for blocks no longer present
5. Update post categories only if changes are needed

## Frequently Asked Questions

### Does this work with custom blocks?

Yes! The plugin detects all registered blocks, including custom blocks from themes and other plugins.

### Will this remove my existing categories?

No, the plugin uses an additive approach. It adds new categories based on blocks but preserves all existing categories.

### What happens if I delete a category that's mapped to a block?

The mapping will remain in settings but won't cause errors. The plugin safely handles missing categories.

### Can I map the same category to multiple blocks?

Absolutely! You can assign any category to as many blocks as you want.

### Does this work with reusable blocks?

Yes, the plugin detects blocks within reusable blocks as well.

## Support

For bug reports and feature requests, please create an issue on GitHub.

## License

This plugin is licensed under the GPL v2 or later.

## Changelog

### 1.0.0
- Initial release
- Block-to-category mapping functionality
- Automatic category assignment on post save
- Optional category removal when blocks are removed
- Settings page with block search and filtering
- Support for all registered WordPress blocks
