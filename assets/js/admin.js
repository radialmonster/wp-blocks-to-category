/**
 * Admin JavaScript for WP Blocks to Category
 */

(function($) {
    'use strict';

    $(document).ready(function() {
        // Initialize the admin page
        WPBTC_Admin.init();
    });

    var WPBTC_Admin = {
        /**
         * Initialize admin functionality
         */
        init: function() {
            this.bindEvents();
        },

        /**
         * Bind event handlers
         */
        bindEvents: function() {
            // Save settings button
            $('#wpbtc-save-settings').on('click', this.saveSettings.bind(this));

            // Block search filter
            $('#wpbtc-block-search').on('input', this.filterBlocks.bind(this));

            // Track changes to category selects
            $('.wpbtc-category-select').on('change', this.updateCategoryCount.bind(this));

            // Process existing posts button
            $('#wpbtc-process-existing').on('click', this.processExistingPosts.bind(this));
        },

        /**
         * Save settings via AJAX
         */
        saveSettings: function(e) {
            e.preventDefault();

            var $button = $('#wpbtc-save-settings');
            var $spinner = $('#wpbtc-spinner');
            var $notice = $('#wpbtc-notice');

            // Collect all mappings
            var mappings = {};
            $('.wpbtc-category-select').each(function() {
                var blockName = $(this).data('block');
                var selectedCategories = $(this).val() || [];

                // Convert to integers
                selectedCategories = selectedCategories.map(function(id) {
                    return parseInt(id, 10);
                });

                if (selectedCategories.length > 0) {
                    mappings[blockName] = selectedCategories;
                }
            });

            // Get removal setting
            var removeCategories = $('#remove_categories_on_block_removal').is(':checked');

            // Show loading state
            $button.prop('disabled', true);
            $spinner.addClass('is-active');
            $notice.hide();

            // Send AJAX request
            $.ajax({
                url: wpbtc_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'wpbtc_save_mappings',
                    nonce: wpbtc_ajax.nonce,
                    mappings: JSON.stringify(mappings),
                    remove_categories_on_block_removal: removeCategories ? '1' : '0'
                },
                success: function(response) {
                    if (response.success) {
                        WPBTC_Admin.showNotice(response.data.message, 'success');
                    } else {
                        WPBTC_Admin.showNotice(response.data.message || 'An error occurred', 'error');
                    }
                },
                error: function(xhr, status, error) {
                    WPBTC_Admin.showNotice('Failed to save settings: ' + error, 'error');
                },
                complete: function() {
                    $button.prop('disabled', false);
                    $spinner.removeClass('is-active');
                }
            });
        },

        /**
         * Filter blocks based on search input
         */
        filterBlocks: function(e) {
            var searchTerm = $(e.target).val().toLowerCase();
            var $rows = $('.wpbtc-mapping-row');
            var visibleCount = 0;

            $rows.each(function() {
                var blockName = $(this).data('block-name').toLowerCase();
                var blockTitle = $(this).data('block-title').toLowerCase();

                if (blockName.includes(searchTerm) || blockTitle.includes(searchTerm)) {
                    $(this).show();
                    visibleCount++;
                } else {
                    $(this).hide();
                }
            });

            // Show/hide no results message
            if (visibleCount === 0) {
                $('.wpbtc-mappings-table').hide();
                $('.wpbtc-no-results').show();
            } else {
                $('.wpbtc-mappings-table').show();
                $('.wpbtc-no-results').hide();
            }
        },

        /**
         * Update category count description
         */
        updateCategoryCount: function(e) {
            var $select = $(e.target);
            var $row = $select.closest('tr');
            var $description = $row.find('.description');
            var count = $select.val() ? $select.val().length : 0;

            if (count > 0) {
                var text = count === 1 ? '1 category assigned' : count + ' categories assigned';
                $description.text(text);
            } else {
                $description.text('No categories assigned');
            }
        },

        /**
         * Show notification message
         */
        showNotice: function(message, type) {
            var $notice = $('#wpbtc-notice');

            $notice
                .removeClass('success error')
                .addClass(type)
                .html('<p>' + message + '</p>')
                .fadeIn();

            // Auto-hide success messages after 5 seconds
            if (type === 'success') {
                setTimeout(function() {
                    $notice.fadeOut();
                }, 5000);
            }
        },

        /**
         * Process existing posts in batches
         */
        processExistingPosts: function(e) {
            e.preventDefault();

            var $button = $('#wpbtc-process-existing');
            var $spinner = $('#wpbtc-process-spinner');
            var $progressContainer = $('#wpbtc-progress-container');
            var $progressFill = $('#wpbtc-progress-fill');
            var $progressText = $('#wpbtc-progress-text');

            // Confirm before processing
            if (!confirm('This will process all existing published posts and assign categories based on their blocks. Continue?')) {
                return;
            }

            // Show loading state
            $button.prop('disabled', true);
            $spinner.addClass('is-active');
            $progressContainer.show();
            $progressFill.css('width', '0%');
            $progressText.text('Starting...');

            // Start processing from offset 0
            this.processPostsBatch(0, $button, $spinner, $progressContainer, $progressFill, $progressText);
        },

        /**
         * Process a batch of posts recursively
         */
        processPostsBatch: function(offset, $button, $spinner, $progressContainer, $progressFill, $progressText) {
            $.ajax({
                url: wpbtc_ajax.ajax_url,
                type: 'POST',
                data: {
                    action: 'wpbtc_process_existing_posts',
                    nonce: wpbtc_ajax.nonce,
                    offset: offset
                },
                success: function(response) {
                    if (response.success) {
                        var data = response.data;

                        // Update progress
                        var percentage = (data.completed / data.total) * 100;
                        $progressFill.css('width', percentage + '%');
                        $progressText.text(data.message);

                        // Continue processing if there are more posts
                        if (data.continue) {
                            WPBTC_Admin.processPostsBatch(
                                data.completed,
                                $button,
                                $spinner,
                                $progressContainer,
                                $progressFill,
                                $progressText
                            );
                        } else {
                            // All done
                            $progressText.text('Complete! Processed ' + data.total + ' posts.');
                            WPBTC_Admin.showNotice('Successfully processed all posts!', 'success');

                            // Reset UI after delay
                            setTimeout(function() {
                                $button.prop('disabled', false);
                                $spinner.removeClass('is-active');
                                $progressContainer.fadeOut();
                            }, 2000);
                        }
                    } else {
                        WPBTC_Admin.showNotice(response.data.message || 'An error occurred', 'error');
                        $button.prop('disabled', false);
                        $spinner.removeClass('is-active');
                        $progressContainer.hide();
                    }
                },
                error: function(xhr, status, error) {
                    WPBTC_Admin.showNotice('Failed to process posts: ' + error, 'error');
                    $button.prop('disabled', false);
                    $spinner.removeClass('is-active');
                    $progressContainer.hide();
                }
            });
        }
    };

})(jQuery);
