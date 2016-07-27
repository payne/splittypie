import Ember from "ember";

const { service } = Ember.inject;

export default Ember.Service.extend({
    syncQueue: service(),

    save(event, transaction) {
        let operation = "updateTransaction";

        if (transaction.get("isNew")) {
            operation = "createTransaction";
            event.get("transactions").addObject(transaction);
        }

        return event.save().then(() => {
            const payload = transaction.serialize({ includeId: true });

            this.get("syncQueue").enqueue(operation, payload);

            // workaround, if I don't save here model will remain in isNew or dirty state
            // offline adapter for transaction is overridden to prevent from
            // saving second time on "transactions" node to indexedDB
            // localforage adapter should deal with it but it doesn't
            return transaction.save();
        });
    },

    remove(transaction) {
        const event = transaction.get("event");
        const eventId = event.get("id");
        const id = transaction.get("id");

        event.get("transactions").removeObject(transaction);
        return event.save().then(() => {
            this.get("syncQueue").enqueue("destroyTransaction", { eventId, id });

            // workaround, localforage adapter should deal with it
            // but it doesn't unload record from store
            return transaction.destroyRecord();
        });
    },
});