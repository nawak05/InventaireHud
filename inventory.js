var type = "normal";
var disabled = false;
var disabledFunction = null;
var empresaName = null;
var ownerHouse = null;

window.addEventListener("message", function (event) {
    if (event.data.action == "display") {
        type = event.data.type
        disabled = false;

        if (type === "normal") {
            $(".info-div").hide();
        } else if (type === "trunk") {
            $(".info-div").show();
        } else if (type === "shop") {
            $(".info-div").show();
        } else if (type === "property") {
            $(".info-div").hide();
			ownerHouse = event.data.owner;
		} else if (type === "motel") {
            $(".info-div").hide();
			ownerHouse = event.data.owner;
		} else if (type === "empresa") {
            $(".info-div").hide();
			empresaName = event.data.empresaName;
        } else if (type === "player") {
            $(".info-div").show();
        }

		
		$(".info-div").hide();

        $(".ui").fadeIn();
    } else if (event.data.action == "hide") {
        $("#dialog").dialog("close");
        $(".ui").fadeOut();
        $(".item").remove();
        $("#otherInventory").html("<div id=\"noSecondInventoryMessage\"></div>");
        $("#noSecondInventoryMessage").html(invLocale.secondInventoryNotAvailable);
    } else if (event.data.action == "setItems") {
        inventorySetup(event.data.itemList, event.data.fastItems);

        $('.item').draggable({
            helper: 'clone',
            appendTo: 'body',
            containment: "window",
            zIndex: 99999,
            revert: 'invalid',
            start: function (event, ui) {
                if (disabled) {
                    return false;
                }

                $(this).css('background-image', 'none');
                itemData = $(this).data("item");
                itemInventory = $(this).data("inventory");

                if (itemInventory == "second" || !itemData.canRemove) {
                    $("#drop").addClass("disabled");
                    $("#give").addClass("disabled");
                }

                if (itemInventory == "second" || !itemData.usable) {
                    $("#use").addClass("disabled");
                }
            },
            stop: function () {
                itemData = $(this).data("item");

                if (itemData !== undefined && itemData.name !== undefined) {
                    $(this).css('background-image', 'url(\'img/items/' + itemData.name + '.png\'');
                    $("#drop").removeClass("disabled");
                    $("#use").removeClass("disabled");
                    $("#give").removeClass("disabled");
                }
            }
        });
    } else if (event.data.action == "setSecondInventoryItems") {
        secondInventorySetup(event.data.itemList);
    } else if (event.data.action == "setShopInventoryItems") {
        shopInventorySetup(event.data.itemList)
    } else if (event.data.action == "setInfoText") {
        $(".info-div").html(event.data.text);
    } else if (event.data.action == "nearPlayers") {
        $("#nearPlayers").html("");

        $.each(event.data.players, function (index, player) {
            $("#nearPlayers").append('<button class="nearbyPlayerButton" data-player="' + player.player + '">' + player.label + ' (' + player.player + ')</button>');
        });

        $("#dialog").dialog("open");

        $(".nearbyPlayerButton").click(function () {
            $("#dialog").dialog("close");
            player = $(this).data("player");
            $.post("http://Inventaire/GiveItem", JSON.stringify({
                player: player,
                item: event.data.item,
                number: parseInt($("#count").val())
            }));
        });
    }
});

function closeInventory() {
    $.post("http://Inventaire/NUIFocusOff", JSON.stringify({}));
}

function inventorySetup(items,fastItems) {
    $("#playerInventory").html("");
    $.each(items, function (index, item) {
        count = setCount(item);

        $("#playerInventory").append('<div class="slot"><div id="item-' + index + '" class="item" style = "background-image: url(\'img/items/' + item.name + '.png\')">' +
            '<div class="item-count">' + count + '</div> <div class="item-name">' + item.label + '</div> </div ><div class="item-name-bg"></div></div>');
        $('#item-' + index).data('item', item);
        $('#item-' + index).data('inventory', "main");
    });
	$("#playerInventoryFastItems").html("");
    var i;
    for (i = 1; i < 4; i++) {
		
        $("#playerInventoryFastItems").append('<div class="slotFast"><div id="itemFast-' + i + '" class="item" >' +
            '<div class="keybind"></div><div class="item-count"></div> <div class="item-name"></div> </div ><div class="item-name-bg"></div></div>');
    }
    $.each(fastItems, function(index, item) {
        count = setCount(item);
        $('#itemFast-' + item.slot).css("background-image", 'url(\'img/items/' + item.name + '.png\')');
        $('#itemFast-' + item.slot).html('<div class="keybind">' + item.slot + '</div><div class="item-count">' + count + '</div> <div class="item-name">' + item.label + '</div> <div class="item-name-bg"></div>');
        $('#itemFast-' + item.slot).data('item', item);
        $('#itemFast-' + item.slot).data('inventory', "fast");
    });
    makeDraggablesFast()
}

function secondInventorySetup(items) {
    $("#otherInventory").html("");
    $.each(items, function (index, item) {
        count = setCount(item);

        $("#otherInventory").append('<div class="slot"><div id="itemOther-' + index + '" class="item" style = "background-image: url(\'img/items/' + item.name + '.png\')">' +
            '<div class="item-count">' + count + '</div> <div class="item-name">' + item.label + '</div> </div ><div class="item-name-bg"></div></div>');
        $('#itemOther-' + index).data('item', item);
        $('#itemOther-' + index).data('inventory', "second");
    });
}

function shopInventorySetup(items) {
    $("#otherInventory").html("");
    $.each(items, function (index, item) {
        //count = setCount(item)
        cost = setCost(item);

        $("#otherInventory").append('<div class="slot"><div id="itemOther-' + index + '" class="item" style = "background-image: url(\'img/items/' + item.name + '.png\')">' +
            '<div class="item-count">' + cost + '</div> <div class="item-name">' + item.label + '</div> </div ><div class="item-name-bg"></div></div>');
        $('#itemOther-' + index).data('item', item);
        $('#itemOther-' + index).data('inventory', "second");
    });
}

function Interval(time) {
    var timer = false;
    this.start = function () {
        if (this.isRunning()) {
            clearInterval(timer);
            timer = false;
        }

        timer = setInterval(function () {
            disabled = false;
        }, time);
    };
    this.stop = function () {
        clearInterval(timer);
        timer = false;
    };
    this.isRunning = function () {
        return timer !== false;
    };
}

function disableInventory(ms) {
    disabled = true;

    if (disabledFunction === null) {
        disabledFunction = new Interval(ms);
        disabledFunction.start();
    } else {
        if (disabledFunction.isRunning()) {
            disabledFunction.stop();
        }

        disabledFunction.start();
    }
}

function setCount(item) {
    count = item.count

    if (item.limit > 0) {
        count = item.count + " / " + item.limit
    }

    if (item.type === "item_weapon") {
        if (count == 0) {
            count = "";
        } else {
            count = '<img src="img/bullet.png" class="ammoIcon"> ' + item.count;
        }
    }

    if (item.type === "item_account" || item.type === "item_money") {
        count = formatMoney(item.count);
    }

    return count;
}

function setCost(item) {
    cost = item.price

    if (item.price == 0){
        cost = item.price + '€'
    }
    if (item.price > 0) {
        cost = item.price + '€'
    }
    return cost;
}

function formatMoney(n, c, d, t) {
    var c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
        j = (j = i.length) > 3 ? j % 3 : 0;

    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t);
};

$(document).ready(function () {
    $("#count").focus(function () {
        $(this).val("")
    }).blur(function () {
        if ($(this).val() == "") {
            $(this).val("1")
        }
    });

    $("body").on("keyup", function (key) {
        if (Config.closeKeys.includes(key.which)) {
            closeInventory();
        }
    });

    $('#use').droppable({
        hoverClass: 'hoverControl',
        drop: function (event, ui) {
            itemData = ui.draggable.data("item");

            if (itemData == undefined || itemData.usable == undefined) {
                return;
            }

            itemInventory = ui.draggable.data("inventory");

            if (itemInventory == undefined || itemInventory == "second") {
                return;
            }

            if (itemData.usable) {
                disableInventory(300);
                $.post("http://Inventaire/UseItem", JSON.stringify({
                    item: itemData
                }));
            }
        }
    });

    $('#give').droppable({
        hoverClass: 'hoverControl',
        drop: function (event, ui) {
            itemData = ui.draggable.data("item");

            if (itemData == undefined || itemData.canRemove == undefined) {
                return;
            }

            itemInventory = ui.draggable.data("inventory");

            if (itemInventory == undefined || itemInventory == "second") {
                return;
            }

            if (itemData.canRemove) {
                disableInventory(300);
                $.post("http://Inventaire/GetNearPlayers", JSON.stringify({
                    item: itemData
                }));
            }
        }
    });

    $('#drop').droppable({
        hoverClass: 'hoverControl',
        drop: function (event, ui) {
            itemData = ui.draggable.data("item");

            if (itemData == undefined || itemData.canRemove == undefined) {
                return;
            }

            itemInventory = ui.draggable.data("inventory");

            if (itemInventory == undefined || itemInventory == "second") {
                return;
            }

            if (itemData.canRemove) {
                disableInventory(300);
                $.post("http://Inventaire/DropItem", JSON.stringify({
                    item: itemData,
                    number: parseInt($("#count").val())
                }));
            }
        }
    });

    $('#playerInventory').droppable({
        drop: function (event, ui) {
            itemData = ui.draggable.data("item");
            itemInventory = ui.draggable.data("inventory");

            if (type === "trunk" && itemInventory === "second") {
                disableInventory(500);
                $.post("http://Inventaire/TakeFromTrunk", JSON.stringify({
                    item: itemData,
                    number: parseInt($("#count").val())
                }));
            } else if (type === "property" && itemInventory === "second") {
                disableInventory(500);
                $.post("http://Inventaire/TakeFromProperty", JSON.stringify({
                    item: itemData,
                    number: parseInt($("#count").val()),
					owner : ownerHouse
                }));
            } else if (type === "player" && itemInventory === "second") {
                disableInventory(500);
                $.post("http://Inventaire/TakeFromPlayer", JSON.stringify({
                    item: itemData,
                    number: parseInt($("#count").val())
                }));
            } else if (type === "shop" && itemInventory === "second") {
                disableInventory(500);
                $.post("http://Inventaire/TakeFromShop", JSON.stringify({
                    item: itemData,
                    number: parseInt($("#count").val())
                }));
            } else if (type === "motel" && itemInventory === "second") {
                disableInventory(500);
                $.post("http://Inventaire/TakeFromMotel", JSON.stringify({
                    item: itemData,
                    number: parseInt($("#count").val()),
					owner : ownerHouse
                }));
			} else if (type === "empresa" && itemInventory === "second") {
                disableInventory(500);
                $.post("http://Inventaire/TakeFromEmpresa", JSON.stringify({
                    item: itemData,
                    number: parseInt($("#count").val()),
					empresa : empresaName
                }));
            } else if (type === "normal" && itemInventory === "fast") {
                disableInventory(500);
                $.post("http://Inventaire/TakeFromFast", JSON.stringify({
                    item: itemData
                }));
            }
        }
    });

    $('#otherInventory').droppable({
        drop: function (event, ui) {
            itemData = ui.draggable.data("item");
            itemInventory = ui.draggable.data("inventory");

            if (type === "trunk" && itemInventory === "main") {
                disableInventory(500);
                $.post("http://Inventaire/PutIntoTrunk", JSON.stringify({
                    item: itemData,
                    number: parseInt($("#count").val())
                }));
            } else if (type === "property" && itemInventory === "main") {
                disableInventory(500);
                $.post("http://Inventaire/PutIntoProperty", JSON.stringify({
                    item: itemData,
                    number: parseInt($("#count").val()),
					owner : ownerHouse
                }));
            } else if (type === "motel" && itemInventory === "main") {
                disableInventory(500);
                $.post("http://Inventaire/PutIntoMotel", JSON.stringify({
                    item: itemData,
                    number: parseInt($("#count").val()),
					owner : ownerHouse
                }));
			} else if (type === "empresa" && itemInventory === "main") {
                disableInventory(500);
                $.post("http://Inventaire/PutIntoEmpresa", JSON.stringify({
                    item: itemData,
                    number: parseInt($("#count").val()),
					empresa : empresaName
                }));
            } else if (type === "player" && itemInventory === "main") {
                disableInventory(500);
                $.post("http://Inventaire/PutIntoPlayer", JSON.stringify({
                    item: itemData,
                    number: parseInt($("#count").val())
                }));
            }
        }
    });

    $("#count").on("keypress keyup blur", function (event) {
        $(this).val($(this).val().replace(/[^\d].+/, ""));
        if ((event.which < 48 || event.which > 57)) {
            event.preventDefault();
        }
    });
});

$.widget('ui.dialog', $.ui.dialog, {
    options: {
        // Determine if clicking outside the dialog shall close it
        clickOutside: false,
        // Element (id or class) that triggers the dialog opening 
        clickOutsideTrigger: ''
    },
    open: function () {
        var clickOutsideTriggerEl = $(this.options.clickOutsideTrigger),
            that = this;
        if (this.options.clickOutside) {
            // Add document wide click handler for the current dialog namespace
            $(document).on('click.ui.dialogClickOutside' + that.eventNamespace, function (event) {
                var $target = $(event.target);
                if ($target.closest($(clickOutsideTriggerEl)).length === 0 &&
                    $target.closest($(that.uiDialog)).length === 0) {
                    that.close();
                }
            });
        }
        // Invoke parent open method
        this._super();
    },
    close: function () {
        // Remove document wide click handler for the current dialog
        $(document).off('click.ui.dialogClickOutside' + this.eventNamespace);
        // Invoke parent close method 
        this._super();
    },
});

function makeDraggablesFast() {
    $('#itemFast-1').droppable({
        drop: function(event, ui) {
            itemData = ui.draggable.data("item");
            itemInventory = ui.draggable.data("inventory");

            if (type === "normal" && (itemInventory === "main" || itemInventory === "fast") && itemData.type === "item_weapon") {
                disableInventory(500);
                $.post("http://Inventaire/PutIntoFast", JSON.stringify({
                    item: itemData,
                    slot: 1
                }));
            }
        }
    });
    $('#itemFast-2').droppable({
        drop: function(event, ui) {
            itemData = ui.draggable.data("item");
            itemInventory = ui.draggable.data("inventory");

            if (type === "normal" && (itemInventory === "main" || itemInventory === "fast") && itemData.type === "item_weapon") {
                disableInventory(500);
                $.post("http://Inventaire/PutIntoFast", JSON.stringify({
                    item: itemData,
                    slot: 2
                }));
            }
        }
    });
    $('#itemFast-3').droppable({
        drop: function(event, ui) {
            itemData = ui.draggable.data("item");
            itemInventory = ui.draggable.data("inventory");

            if (type === "normal" && (itemInventory === "main" || itemInventory === "fast") && itemData.type === "item_weapon") {
                disableInventory(500);
                $.post("http://Inventaire/PutIntoFast", JSON.stringify({
                    item: itemData,
                    slot: 3
                }));
            }
        }
    });
}