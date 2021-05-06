/* eslint-disable react/prop-types */
import React from "react";
import { Box } from "grid-styled";
import _ from "underscore";
import { connect } from "react-redux";
import { withRouter } from "react-router";

import Collection from "metabase/entities/collections";
import Search from "metabase/entities/search";

import { getUserIsAdmin } from "metabase/selectors/user";

import listSelect from "metabase/hoc/ListSelect";

import BulkActions from "metabase/collections/components/BulkActions";
import Header from "metabase/collections/components/Header";
import ItemList from "metabase/collections/components/ItemList";
import PinnedItems from "metabase/collections/components/PinnedItems";

import ItemsDragLayer from "metabase/containers/dnd/ItemsDragLayer";
import PaginationControls from "metabase/components/PaginationControls";

const PAGE_SIZE = 25;

@Collection.load({
  id: (_, props) => props.collectionId,
  reload: true,
})
@listSelect({
  listProp: "unpinned",
  keyForItem: item => `${item.model}:${item.id}`,
})
@withRouter
export default class CollectionContent extends React.Component {
  state = {
    selectedItems: null,
    selectedAction: null,

    page: 0,
  };

  handleBulkArchive = async () => {
    try {
      await Promise.all(
        this.props.selected.map(item => item.setArchived(true)),
      );
    } finally {
      this.handleBulkActionSuccess();
    }
  };

  handleBulkMoveStart = () => {
    this.setState({
      selectedItems: this.props.selected,
      selectedAction: "move",
    });
  };

  handleBulkMove = async collection => {
    try {
      await Promise.all(
        this.state.selectedItems.map(item => item.setCollection(collection)),
      );
      this.handleCloseModal();
    } finally {
      this.handleBulkActionSuccess();
    }
  };

  handleBulkActionSuccess = () => {
    // Clear the selection in listSelect
    // Fixes an issue where things were staying selected when moving between
    // different collection pages
    this.props.onSelectNone();
  };

  handleCloseModal = () => {
    this.setState({ selectedItems: null, selectedAction: null });
  };

  handleNextPage = () =>
    this.setState(prev => ({
      page: prev.page + 1,
    }));

  handlePreviousPage = () =>
    this.setState(prev => ({
      page: prev.page - 1,
    }));

  handleFilterChange = () => {
    this.setState({ page: 0 })
  }

  render() {
    const {
      collection,
      collectionId,

      isAdmin,
      isRoot,
      selected,
      deselected,
      selection,
      onToggleSelected,
      location,

      scrollElement,
    } = this.props;

    const { selectedItems, selectedAction, page } = this.state;

    const unpinnedQuery = {
      collection: collectionId,
      pinned: false,
      // TODO: not yet supported
      // models: location.query.type,
      // limit: PAGE_SIZE,
      // offset: PAGE_SIZE * page,
    };

    const pinnedQuery = {
      collection: collectionId,
      pinned: true,
    };

    return (
      <Search.ListLoader query={unpinnedQuery} wrapped>
        {({ list: unpinnedItems, total }) => {
          const showFilters = unpinnedItems.length > 5;
          return (
            <Search.ListLoader query={pinnedQuery} wrapped>
              {({ list: pinnedItems }) => (
                <Box pt={2}>
                  <Box w={"80%"} ml="auto" mr="auto">
                    <Header
                      isRoot={isRoot}
                      isAdmin={isAdmin}
                      collectionId={collectionId}
                      showFilters={showFilters}
                      collectionHasPins={pinnedItems.length > 0}
                      collection={collection}
                      unpinnedItems={unpinnedItems}
                    />

                    <PinnedItems
                      items={pinnedItems}
                      collection={collection}
                      onMove={selectedItems =>
                        this.setState({
                          selectedItems,
                          selectedAction: "move",
                        })
                      }
                      onCopy={selectedItems =>
                        this.setState({
                          selectedItems,
                          selectedAction: "copy",
                        })
                      }
                    />

                    <ItemList
                      scrollElement={scrollElement}
                      items={unpinnedItems}
                      empty={unpinnedItems.length === 0}
                      showFilters={showFilters}
                      selection={selection}
                      collection={collection}
                      onToggleSelected={onToggleSelected}
                      collectionHasPins={pinnedItems.length > 0}
                      onFilterChange={this.handleFilterChange}
                      onMove={selectedItems =>
                        this.setState({
                          selectedItems,
                          selectedAction: "move",
                        })
                      }
                      onCopy={selectedItems =>
                        this.setState({
                          selectedItems,
                          selectedAction: "copy",
                        })
                      }
                    />
                    <div className="flex justify-end my3">
                      <PaginationControls
                        showTotal
                        page={page}
                        pageSize={PAGE_SIZE}
                        total={total}
                        itemsLength={unpinnedItems.length}
                        onNextPage={this.handleNextPage}
                        onPreviousPage={this.handlePreviousPage}
                      />
                    </div>
                  </Box>
                  <BulkActions
                    selected={selected}
                    onSelectAll={this.props.onSelectAll}
                    onSelectNone={this.props.onSelectNone}
                    handleBulkArchive={this.handleBulkArchive}
                    handleBulkMoveStart={this.handleBulkMoveStart}
                    handleBulkMove={this.handleBulkMove}
                    handleCloseModal={this.handleCloseModal}
                    deselected={deselected}
                    selectedItems={selectedItems}
                    selectedAction={selectedAction}
                  />
                  <ItemsDragLayer selected={selected} />
                </Box>
              )}
            </Search.ListLoader>
          );
        }}
      </Search.ListLoader>
    );
  }
}
