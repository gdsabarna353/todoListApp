//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');

const app = express();
const Today = date.getDate();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

mongoose.connect("mongodb+srv://admin-gdsabarna353:Test-123@cluster0.yqrsm9p.mongodb.net/todolistDB?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });

const itemSchema = new mongoose.Schema({
  name: String
});

const listSchema = new mongoose.Schema({
  name: String,
  listItems: [itemSchema]
});



const Item = mongoose.model("Item", itemSchema);

const List = mongoose.model("List", listSchema);

const task1 = new Item({
  name: "read the book"
});

const task2 = new Item({
  name: "drink water"
});

const task3 = new Item({
  name: "write the letter"
});

const defaultItems = [task1, task2, task3];

// Item.insertMany(defaultItems, function(err){
//   if(err){
//     console.log(err);
//   }else{
//     console.log("Successfully updated the tasks in the database..");
//   }
// });



app.get("/", function (req, res) {
  
  //const tasks = [];
  Item.find(function (err, results) {
    if (err) {
      console.log(err);
    } else if (results.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully updated the tasks in the database..");
        }
      });
      results.forEach(function (task) {
        console.log(task);

      });
      res.redirect("/");
    } else {
      res.render("list", { listTitle: Today, newListItems: results });
    }
  });

});

app.get("/:customListName", function (req, res) {
  const newListName = _.capitalize(req.params.customListName);
  console.log(newListName);
  List.findOne({ name: newListName }, function (err, results) {
    if (err) {
      console.log(err);
    } else if (results === null) {
      //creating a new list
      console.log("list is not found");
      const customlist = new List({
        name: newListName,
        listItems: defaultItems
      });
      customlist.save();
      res.redirect("/" + newListName);
    } else {
      //showing the existing list
      console.log("list is found");
      //console.log(results);
      res.render("list.ejs", { listTitle: results.name, newListItems: results.listItems });
    }
  });
});

app.post("/", function (req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const newItemDocument = new Item({
    name: itemName
  });

  if (listName === Today) {
    newItemDocument.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, results) {
      if (err) {
        console.log(err);
      } else {
        results.listItems.push(newItemDocument);
        results.save();
        res.redirect("/" + listName);
      }
    });
  }

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete", function (req, res) {
  const deletedId = req.body.checkedbox;
  const listName = req.body.listname;
  // console.log(deletedId);

  if (listName === Today) {
    Item.findByIdAndRemove(deletedId, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log(`the document with id ${deletedId} is successfully deleted`);
        res.redirect("/");
      }
    });
    
  }else{
    List.findOneAndUpdate({name: listName}, {$pull: {listItems: {_id: deletedId}}}, function(err, results){
      if(err){
        console.log(err);
      }else{
        console.log(`item with id ${deletedId} from the list ${listName} is successfully deleted`);
        res.redirect("/"+listName);
      }
    });
   
  }

});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
