(function (wp) {
    var registerBlockType = wp.blocks.registerBlockType;
    var InspectorControls = wp.blockEditor.InspectorControls;
    var el = wp.element.createElement;
    var TextControl = wp.components.TextControl;
    var panelBody = wp.components.PanelBody;
    var __ = wp.i18n.__;
    registerBlockType('mycred-gb-blocks/mycred-chart-gain-loss', {
        title: __('Chart Gain/Loss', 'mycred'),
        category: 'mycred',
        attributes: {
            type : {
                type: 'string',
                default: 'pie'
            },
            ctype : {
                type: 'string',
                default: 'mycred_default'
            },
            title : {
                type: 'string',
            },
            animate : {
                type: 'string',
                default: '1'
            },
            bezier : {
                type: 'string',
                default: '1'
            },
            labels : {
                type: 'string',
                default: '1'
            },
            legend : {
                type: 'string',
                default: '1'
            },
            width : {
                type: 'string'
            },
            height : {
                type: 'string'
            },
            gains : {
                type: 'string'
            },
            losses : {
                type: 'string'
            }
        },
        edit: function (props) {
            var type = props.attributes.type;
            var ctype = props.attributes.ctype;
            var title = props.attributes.title;
            var animate = props.attributes.animate;
            var bezier = props.attributes.bezier;
            var labels = props.attributes.labels;
            var legend = props.attributes.legend;
            var width = props.attributes.width;
            var height = props.attributes.height;
            var gains = props.attributes.gains;
            var losses = props.attributes.losses;

            function setTypes(value) {
                props.setAttributes({type: value});
            }

            function setPtypes(value) {
                props.setAttributes({ctype: value});
            }

            function setTitle(value) {
                props.setAttributes({title: value});
            }

            function setAnimate(value) {
                props.setAttributes({animate: value});
            }

            function setBezier(value) {
                props.setAttributes({bezier: value});
            }

            function setLabels(value) {
                props.setAttributes({labels: value});
            }

            function setLegend(value) {
                props.setAttributes({legend: value});
            }

            function setWidth(value) {
                props.setAttributes({width: value});
            }

            function setHeight(value) {
                props.setAttributes({height: value});
            }

            function setGains(value) {
                props.setAttributes({gains: value});
            }

            function setLosses(value) {
                props.setAttributes({losses: value});
            }

            return el('div', {}, [
                el('p', {}, __('Chart Gain/Loss Shortcode', 'mycred') ),
                el(InspectorControls, null,
                    el( panelBody, { title: 'Form Settings', initialOpen: true },
                        el(TextControl, {
                            label: __('Type', 'mycred'),
                            help: __('The chart type to render. Supports: "pie", "doughnut", "line", "bar" and "polarArea".', 'mycred'),
                            value: type,
                            onChange: setTypes

                        }),
                        el(TextControl, {
                            label: __('Point Type', 'mycred'),
                            help: __('The point type we want to show data for. Should only be used when you need to show data for a custom point type.', 'mycred'),
                            value: ctype,
                            onChange: setPtypes

                        }),
                        el(TextControl, {
                            label: __('Title', 'mycred'),
                            help: __('To set a title for the chart.', 'mycred'),
                            value: title,
                            onChange: setTitle

                        }),
                        el(TextControl, {
                            label: __('Animate', 'mycred'),
                            help: __('If the chart should be animated (1) or not (0).', 'mycred'),
                            value: animate,
                            onChange: setAnimate

                        }),
                        el(TextControl, {
                            label: __('Bezier', 'mycred'),
                            help: __('If line charts should use bezier curves (1) or not (0)', 'mycred'),
                            value: bezier,
                            onChange: setBezier

                        }),
                        el(TextControl, {
                            label: __('Labels', 'mycred'),
                            help: __('If labels should be shown in the chart (1) or not (0). Not all chart types use labels, it is mainly for bar and line charts where we have both an x and y axis.', 'mycred'),
                            value: labels,
                            onChange: setLabels
                        }),
                        el(TextControl, {
                            label: __('Legend', 'mycred'),
                            help: __('If a legend should be shown in the chart (1) or not (0). Not all charts show legends.', 'mycred'),
                            value: legend,
                            onChange: setLegend
                        }),
                        el(TextControl, {
                            label: __('Width', 'mycred'),
                            help: __('The chart canvas width. By default the chart will render full with of the container where the shortcode is used. Can be either a pixel value (without px) or a percentage value (with %).', 'mycred'),
                            value: width,
                            onChange: setWidth
                        }),
                        el(TextControl, {
                            label: __('Height', 'mycred'),
                            help: __('The chart canvas height. Can be either a pixel value (without px) or a percentage value (with %).', 'mycred'),
                            value: height,
                            onChange: setHeight
                        }),
                        el(TextControl, {
                            label: __('Gain', 'mycred'),
                            help: __('use a different word than "Gains".', 'mycred'),
                            value: gains,
                            onChange: setGains
                        }),
                        el(TextControl, {
                            label: __('Loss', 'mycred'),
                            help: __('use a different word than "Losses".', 'mycred'),
                            value: losses,
                            onChange: setLosses
                        }),
                    )
                )
            ]);
        },
        save: function (props) {
            return null;
        }
    });
})(window.wp);