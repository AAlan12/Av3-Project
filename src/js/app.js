App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load Travel Packages.
    $.getJSON('../TravelPackages.json', function(data) {
      var TravelRow = $('#TravelPackagesRow');
      var TravelTemplate = $('#TravelPackagesTemplate');

      for (i = 0; i < data.length; i ++) {
        TravelTemplate.find('.panel-title').text(data[i].name);
        TravelTemplate.find('img').attr('src', data[i].picture);
        TravelTemplate.find('.TravelPackages-Guide').text(data[i].guide);
        TravelTemplate.find('.TravelPackages-Country').text(data[i].country);
        TravelTemplate.find('.TravelPackages-location').text(data[i].partnerCompany);
        TravelTemplate.find('.TravelPackages-Value').text(data[i].value);
        TravelTemplate.find('.btn-Purchase').attr('data-id', data[i].id);

        TravelRow.append(TravelTemplate.html());
      }
    });

    return await App.initWeb3();
  },

//iniWeb3 inicio
  initWeb3: async function() {
    // Modern dapp browsers...
if (window.ethereum) {
  App.web3Provider = window.ethereum;
  try {
    // Request account access
    await window.ethereum.request({ method: "eth_requestAccounts" });;
  } catch (error) {
    // User denied account access...
    console.error("User denied account access")
  }
}
// Legacy dapp browsers...
else if (window.web3) {
  App.web3Provider = window.web3.currentProvider;
}
// If no injected web3 instance is detected, fall back to Ganache
else {
  App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
}
web3 = new Web3(App.web3Provider);
//init web3 fim

    return App.initContract();
  },


  //initContract inicio
  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
    
      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });
    //initContract fim

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-Purchase', App.handleAdopt);
  },

  //markAdopted inicio
  markAdopted: function() {
    var adoptionInstance;

App.contracts.Adoption.deployed().then(function(instance) {
  adoptionInstance = instance;

  return adoptionInstance.getAdopters.call();
}).then(function(adopters) {
  for (i = 0; i < adopters.length; i++) {
    if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
      $('.panel-TravelPackages').eq(i).find('button').text('Success').attr('disabled', true);
    }
  }
}).catch(function(err) {
  console.log(err.message);
});

//mark adopted fim

  },



  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));
//handleAdopt inicio 

var adoptionInstance;

web3.eth.getAccounts(function(error, accounts) {
  if (error) {
    console.log(error);
  }

  var account = accounts[0];

  App.contracts.Adoption.deployed().then(function(instance) {
    adoptionInstance = instance;

    // Execute adopt as a transaction by sending account
    return adoptionInstance.adopt(petId, {from: account});
  }).then(function(result) {
    return App.markAdopted();
  }).catch(function(err) {
    console.log(err.message);
  });
});

// handle adopt fim
  }

};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
