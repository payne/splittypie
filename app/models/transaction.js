import DS from "ember-data";

export default DS.Model.extend({
    name: DS.attr("string"),
    amount: DS.attr("number"),
    event: DS.belongsTo("event", {async: false}),
    payer: DS.belongsTo("user", {async: false}),
    participants: DS.hasMany("user", {async: false})
});
