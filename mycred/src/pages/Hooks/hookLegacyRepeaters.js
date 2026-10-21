/**
 * Legacy hook repeater buttons (prefs_html) inside the React Hooks settings view.
 * Toolkit Pro scripts bind on document.ready before prefs_html is injected.
 */
export function initBdayProRepeater( $root ) {
	if ( ! $root?.length || ! $root.find( '.mycred-add-bday-pro-hook' ).length ) {
		return;
	}

	const updateRemoveButtons = () => {
		const $instances = $root.find( '.repeater-hook-instance' );
		const $removeBtns = $root.find( '.mycred-remove-bday-pro-hook' );

		if ( $instances.length > 1 ) {
			$removeBtns.removeClass( 'mycred-bday-pro-remove-hidden' ).show();
		} else {
			$removeBtns.addClass( 'mycred-bday-pro-remove-hidden' ).hide();
		}
	};

	$root.off( 'click.mycredHooksBdayPro' );
	$root.on( 'click.mycredHooksBdayPro', '.mycred-add-bday-pro-hook', function ( e ) {
		e.preventDefault();
		const $btn = window.jQuery( this );
		const $instance = $btn.closest( '.repeater-hook-instance' );
		const $clone = $instance.clone();

		$clone.find( 'input.mycred-bday-pro-creds' ).val( 10 );
		$clone.find( 'input.mycred-bday-pro-log' ).val( '%plural% for Birthday.' );
		$clone.find( 'input.mycred-bday-pro-age' ).val( '' );
		$instance.after( $clone );
		updateRemoveButtons();
	} );

	$root.on( 'click.mycredHooksBdayPro', '.mycred-remove-bday-pro-hook', function ( e ) {
		e.preventDefault();

		if ( $root.find( '.repeater-hook-instance' ).length <= 1 ) {
			return;
		}

		if ( window.confirm( 'Are you sure you want to remove this hook?' ) ) {
			window.jQuery( this ).closest( '.repeater-hook-instance' ).remove();
		}

		updateRemoveButtons();
	} );

	updateRemoveButtons();
}
