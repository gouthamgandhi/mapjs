/*global beforeEach, content, describe, expect, it, jasmine, spyOn, MAPJS*/
describe('MapModel', function () {
	'use strict';
	it('should be able to instantiate MapModel', function () {
		var layoutCalculator,
			underTest = new MAPJS.MapModel(layoutCalculator);
		expect(underTest).not.toBeUndefined();
	});
	it('should dispatch inputEnabledChanged event when input is disabled', function () {
		var layoutCalculator,
			underTest = new MAPJS.MapModel(layoutCalculator),
			inputEnabledChangedListener = jasmine.createSpy();
		underTest.addEventListener('inputEnabledChanged', inputEnabledChangedListener);

		underTest.setInputEnabled(false);

		expect(inputEnabledChangedListener).toHaveBeenCalledWith(false);
	});
	describe('events dispatched by MapModel when idea/layout is changed', function () {
		var underTest,
			anIdea,
			layoutBefore,
			layoutAfter;
		beforeEach(function () {
			var layoutCalculatorLayout,
				layoutCalculator = function () {
					return layoutCalculatorLayout;
				};
			layoutBefore = {
				nodes: {
					1: {
						x: 10,
						y: 20,
						title: 'This node will be removed'
					},
					2: {
						x: 50,
						y: 20,
						title: 'second'
					}
				}
			};
			layoutAfter = {
				nodes: {
					2: {
						x: 49,
						y: 20,
						title: 'This node will be moved'
					},
					3: {
						x: 100,
						y: 200,
						title: 'This node will be created'
					}
				}
			};
			underTest = new MAPJS.MapModel(layoutCalculator);
			layoutCalculatorLayout = layoutBefore;
			anIdea = content({});
			underTest.setIdea(anIdea);
			layoutCalculatorLayout = layoutAfter;
		});
		it('should dispatch nodeCreated event when a node is created because idea is changed', function () {
			var nodeCreatedListener = jasmine.createSpy();
			underTest.addEventListener('nodeCreated', nodeCreatedListener);

			anIdea.dispatchEvent('changed');

			expect(nodeCreatedListener).toHaveBeenCalledWith(layoutAfter.nodes[3]);
		});
		it('should dispatch nodeMoved event when a node is moved because idea is changed', function () {
			var nodeMovedListener = jasmine.createSpy();
			underTest.addEventListener('nodeMoved', nodeMovedListener);

			anIdea.dispatchEvent('changed');

			expect(nodeMovedListener).toHaveBeenCalledWith(layoutAfter.nodes[2]);
		});
		it('should dispatch nodeRemoved event when a node is removed because idea is changed', function () {
			var nodeRemovedListener = jasmine.createSpy();
			underTest.addEventListener('nodeRemoved', nodeRemovedListener);

			anIdea.dispatchEvent('changed');

			expect(nodeRemovedListener).toHaveBeenCalledWith(layoutBefore.nodes[1]);
		});
		it('should dispatch nodeSelectionChanged when a different node is selected', function () {
			var nodeSelectionChangedListener = jasmine.createSpy();
			underTest.addEventListener('nodeSelectionChanged', nodeSelectionChangedListener);

			underTest.selectNode(2);

			expect(nodeSelectionChangedListener).toHaveBeenCalledWith(2, true);
		});
		it('should dispatch nodeSelectionChanged when a different node is selected', function () {
			var nodeSelectionChangedListener = jasmine.createSpy();
			underTest.selectNode(1);
			underTest.addEventListener('nodeSelectionChanged', nodeSelectionChangedListener);

			underTest.selectNode(2);

			expect(nodeSelectionChangedListener).toHaveBeenCalledWith(1, false);
		});
		it('should dispatch nodeEditRequested when a request to edit node is made', function () {
			var nodeEditRequestedListener = jasmine.createSpy();
			underTest.addEventListener('nodeEditRequested:1', nodeEditRequestedListener);
			underTest.selectNode(1);

			underTest.editNode('toolbar', true);

			expect(nodeEditRequestedListener).toHaveBeenCalledWith(true);
		});
	});
	describe('methods delegating to idea', function () {
		var anIdea, underTest;
		beforeEach(function () {
			anIdea = content({
				id: 1,
				title: 'root',
				ideas: {
					10: {
						id: 2,
						title: 'child'
					}
				}
			});
			underTest = new MAPJS.MapModel(function () {
				return {
				};
			});
			underTest.setIdea(anIdea);
		});
		it('should invoke idea.addSubIdea with currently selected idea as parentId when addSubIdea method is invoked', function () {
			spyOn(anIdea, 'addSubIdea');
			underTest.selectNode(123);

			underTest.addSubIdea();

			expect(anIdea.addSubIdea).toHaveBeenCalledWith(123, 'double click to edit');
		});
		it('should invoke idea.addSubIdea with randomly selected title when addSubIdea method is invoked', function () {
			var underTest = new MAPJS.MapModel(
				function () {
					return {};
				},
				'What a beautiful idea!'.split(' ')
			);
			underTest.setIdea(anIdea);
			spyOn(anIdea, 'addSubIdea');
			spyOn(Math, 'random').andReturn(0.6);

			underTest.addSubIdea();

			expect(anIdea.addSubIdea).toHaveBeenCalledWith(1, 'beautiful');
		});
		it('should invoke idea.removeSubIdea with currently selected idea as ideaId when removeSubIdea method', function () {
			spyOn(anIdea, 'removeSubIdea');
			underTest.selectNode(321);

			underTest.removeSubIdea('toolbar');

			expect(anIdea.removeSubIdea).toHaveBeenCalledWith(321);
		});
		it('should invoke idea.updateTitle with specified ideaId when updateTitle method is invoked', function () {
			spyOn(anIdea, 'updateTitle');
			underTest.selectNode(111);

			underTest.updateTitle(112, 'new title');

			expect(anIdea.updateTitle).toHaveBeenCalledWith(112, 'new title');
		});
		it('should invoke idea.addSubIdea with a parent of a currently selected node when addSiblingIdea is invoked', function () {
			underTest.selectNode(2);
			spyOn(anIdea, 'addSubIdea');

			underTest.addSiblingIdea();

			expect(anIdea.addSubIdea).toHaveBeenCalledWith(1, 'double click to edit');
		});
		it('should invoke idea.addSubIdea with a root node if root is currently selected node when addSiblingIdea is invoked (because root has no parent)', function () {
			underTest.selectNode(1);
			spyOn(anIdea, 'addSubIdea');

			underTest.addSiblingIdea();

			expect(anIdea.addSubIdea).toHaveBeenCalledWith(1, 'double click to edit');
		});
	});
	describe('map scaling', function () {
		it('should dispatch mapScaleChanged event when scaleUp method is invoked', function () {
			var underTest = new MAPJS.MapModel(),
				mapScaleChangedListener = jasmine.createSpy();
			underTest.addEventListener('mapScaleChanged', mapScaleChangedListener);

			underTest.scaleUp('toolbar');

			expect(mapScaleChangedListener).toHaveBeenCalledWith(true);
		});
		it('should dispatch mapScaleChanged event when scaleDown method is invoked', function () {
			var underTest = new MAPJS.MapModel(),
				mapScaleChangedListener = jasmine.createSpy();
			underTest.addEventListener('mapScaleChanged', mapScaleChangedListener);

			underTest.scaleDown('toolbar');

			expect(mapScaleChangedListener).toHaveBeenCalledWith(false);
		});
	});
	describe('keyboard navigation', function () {
		var anIdea, underTest;
		beforeEach(function () {
			anIdea = content({
				id: 1,
				title: 'center',
				ideas: {
					'-2': {
						id: 2,
						title: 'lower left'
					},
					'-1': {
						id: 3,
						title: 'upper left'
					},
					1: {
						id: 4,
						title: 'upper right'
					},
					2: {
						id: 5,
						title: 'lower right',
						ideas : {
							1: {
								id: 6
							}
						}
					}
				}
			});
			underTest = new MAPJS.MapModel(function () {
				return {
					nodes: {
						1: { x: 0 },
						2: { x: -10 },
						3: { x: -10 },
						4: { x: 10 },
						5: { x: 10 }
					}
				};
			});
			underTest.setIdea(anIdea);
		});
		it('should select parent when a node is deleted', function () {
			var nodeSelectionChangedListener = jasmine.createSpy();
			underTest.addEventListener('nodeSelectionChanged', nodeSelectionChangedListener);
			underTest.selectNode(6);
			underTest.removeSubIdea('toolbar');
			expect(nodeSelectionChangedListener).toHaveBeenCalledWith(5, true);
		});
		it('should select lowest ranking child when selectNodeRight invoked on and currently selected node is right of central node', function () {
			var nodeSelectionChangedListener = jasmine.createSpy();
			underTest.addEventListener('nodeSelectionChanged', nodeSelectionChangedListener);

			underTest.selectNodeRight();

			expect(nodeSelectionChangedListener).toHaveBeenCalledWith(4, true);
		});
		it('should select parent node when selectNodeRight invoked on a currently selected node left of central node', function () {
			underTest.selectNode(3);
			var nodeSelectionChangedListener = jasmine.createSpy();
			underTest.addEventListener('nodeSelectionChanged', nodeSelectionChangedListener);

			underTest.selectNodeRight();

			expect(nodeSelectionChangedListener).toHaveBeenCalledWith(1, true);
		});
		it('should select lowest ranking child when selectNodeLeft invoked on and currently selected node is left of central node', function () {
			var nodeSelectionChangedListener = jasmine.createSpy();
			underTest.addEventListener('nodeSelectionChanged', nodeSelectionChangedListener);

			underTest.selectNodeLeft();

			expect(nodeSelectionChangedListener).toHaveBeenCalledWith(3, true);
		});
		it('should select parent node when selectNodeLeft invoked on a currently selected node right of central node', function () {
			underTest.selectNode(5);
			var nodeSelectionChangedListener = jasmine.createSpy();
			underTest.addEventListener('nodeSelectionChanged', nodeSelectionChangedListener);

			underTest.selectNodeLeft();

			expect(nodeSelectionChangedListener).toHaveBeenCalledWith(1, true);
		});
		it('should select sibling above when selectNodeUp invoked', function () {
			underTest.selectNode(5);
			var nodeSelectionChangedListener = jasmine.createSpy();
			underTest.addEventListener('nodeSelectionChanged', nodeSelectionChangedListener);

			underTest.selectNodeUp();

			expect(nodeSelectionChangedListener).toHaveBeenCalledWith(4, true);
		});
		it('should select sibling below when selectNodeDown invoked', function () {
			underTest.selectNode(4);
			var nodeSelectionChangedListener = jasmine.createSpy();
			underTest.addEventListener('nodeSelectionChanged', nodeSelectionChangedListener);

			underTest.selectNodeDown();

			expect(nodeSelectionChangedListener).toHaveBeenCalledWith(5, true);
		});
	});
	describe('analytic events', function () {
		var underTest, analyticListener;
		beforeEach(function () {
			underTest = new MAPJS.MapModel(function () {
				return {
					nodes: {
						1: { x: 0 },
						2: { x: -10 },
						3: { x: -10 },
						4: { x: 10 },
						5: { x: 10 }
					}
				};
			});
			var anIdea = content({
				id: 1,
				title: 'center',
				ideas: {
					'-2': {
						id: 2,
						title: 'lower left'
					},
					'-1': {
						id: 3,
						title: 'upper left'
					},
					1: {
						id: 4,
						title: 'upper right'
					},
					2: {
						id: 5,
						title: 'lower right',
						ideas : {
							1: {
								id: 6
							}
						}
					}
				}
			});

			underTest.setIdea(anIdea);
			analyticListener = jasmine.createSpy();
			underTest.addEventListener('analytic', analyticListener);
		});
		it('should dispatch analytic event when scaleUp method is invoked', function () {
			underTest.scaleUp('toolbar');
			expect(analyticListener).toHaveBeenCalledWith('mapModel', 'scaleUp', 'toolbar');
		});
		it('should dispatch analytic event when scaleUp method is invoked', function () {
			underTest.scaleDown('toolbar');

			expect(analyticListener).toHaveBeenCalledWith('mapModel', 'scaleDown', 'toolbar');
		});
		it('should dispatch analytic event when addSubIdea method is invoked', function () {
			underTest.addSubIdea('toolbar');

			expect(analyticListener).toHaveBeenCalledWith('mapModel', 'addSubIdea', 'toolbar');
		});
		it('should dispatch analytic event when editNode method is invoked', function () {
			underTest.editNode('toolbar', true);

			expect(analyticListener).toHaveBeenCalledWith('mapModel', 'editNode', 'toolbar');
		});
		it('should dispatch analytic event when removeSubIdea method is invoked', function () {
			underTest.removeSubIdea('toolbar');

			expect(analyticListener).toHaveBeenCalledWith('mapModel', 'removeSubIdea', 'toolbar');
		});
		it('should dispatch analytic event when addSiblingIdea method is invoked', function () {
			underTest.addSiblingIdea('toolbar');

			expect(analyticListener).toHaveBeenCalledWith('mapModel', 'addSiblingIdea', 'toolbar');
		});
		it('should dispatch analytic event when selectNode[Left,Right,Up,Down] method is invoked', function () {
			['Left', 'Right', 'Up', 'Down'].forEach(function (direction) {
				underTest['selectNode' + direction]('toolbar');

				expect(analyticListener).toHaveBeenCalledWith('mapModel', 'selectNode' + direction, 'toolbar');
			});
		});

	});
});
