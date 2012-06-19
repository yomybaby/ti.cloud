var Utils = {
    loginAsDrillbitUser: asyncTest({
        start: function(callback) {
            var data = {
                login: 'drillbitUser',
                password: 'password'
            };
            Cloud.Users.login(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    callback.Utils.userId = e.users[0].id;
                })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for login response'
    }),

    loginAsChatUser: asyncTest({
        start: function(callback) {
            var data = {
                login: 'chatuser',
                password: 'password'
            };
            Cloud.Users.login(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    callback.Utils.userId = e.users[0].id;
                })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for login response'
    }),

    logout: asyncTest({
        start: function(callback) {
            Cloud.Users.logout(
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    callback.Utils.userId = '';
                })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for logout response'
    })
};

describe("Cloud tests", {
    before_all: function() {
        // Control cloud API debugging
        Cloud = require('ti.cloud');
        Cloud.debug = true;

        this.Utils = {
            userId: ''
        };

        // Namespace specific containers for test results. The idea is that you should define a namespace
        // container so that any information that needs to be tracked from one test to the next within a
        // namespace can be stored / retrieved during the tests for that namespace. This will prevent any
        // other namespace tests from polluting the values in another namespace.
        this.Users = { ids: [] };
        this.Objects = { ids: [] };
        this.Chats = { chatUserId: '', userId: '', groupId: '' };
        this.Places = { ids: [] };
        this.Checkins = { placeId: '', checkinId: '' };
        this.Statuses = { startTime: '' };
        this.Photos = { ids: [] };
        this.Posts = { ids: [] };
        this.Reviews = { postId: '', ids: [] };
        this.PhotoCollections = { ids: [], photoIds: [], subIds: [] };
        this.ACLs = { chatUserId: '' };

        this.verifyAPIs = function(namespace,functions) {
            for (var i = 0; i < functions.length; i++) {
                valueOf(Cloud[namespace][functions[i]]).shouldBeFunction();
            }
        };

        this.convertISOToDate = function(isoDate) {
            isoDate = isoDate.replace(/\D/g," ");
            var dtcomps = isoDate.split(" ");
            dtcomps[1]--;
            return new Date(Date.UTC(dtcomps[0],dtcomps[1],dtcomps[2],dtcomps[3],dtcomps[4],dtcomps[5]));
        };
    },

    // 1. The following tests assume the existence of the application on api.cloud.appcelerator.com.
    // 2. The following users must exist in the application:
    //    username: 'drillbituser'
    //    password: 'password'
    //    username: 'chatuser'
    //    password: 'password'
    // 3. There should not be any other users defined in the application

    // ---------------------------------------------------------------
    // Cloud
    // ---------------------------------------------------------------

    // Test that cloud module is part of TiSDK
	cloudModule: function() {
        // Verify that the module is defined
		valueOf(Cloud).shouldBeObject();
    },

    // Test the usage of the useSecure property
    cloudUseSecure: function() {
        // Verify default value of useSecure
        valueOf(Cloud.useSecure).shouldBeUndefined();
        // Verify useSecure property changes
        Cloud.useSecure = false;
        valueOf(Cloud.useSecure).shouldBeFalse();
        // Verify useSecure resets
        Cloud.useSecure = true;
        valueOf(Cloud.useSecure).shouldBeTrue();
    },

    // ---------------------------------------------------------------
    // Cloud.Users
    // ---------------------------------------------------------------

    // Test that all of the namespace APIs are available
    cloudUsersApi: function() {
        // Verify that all of the methods are exposed
        this.verifyAPIs('Users', [
            'create',
            'login',
            'show',
            'showMe',
            'search',
            'query',
            'update',
            'logout',
            'remove',
            'requestResetPassword'
        ]);
    },

    // Cloud.Users.create
    cloudUsersCreateInvalidArguments: function() {
        valueOf(function() {
            Cloud.Users.create()
        }).shouldThrowException();
        valueOf(function() {
            Cloud.Users.create(0,0)
        }).shouldThrowException();
        valueOf(function() {
            Cloud.Users.create({},0)
        }).shouldThrowException();
        valueOf(function() {
            Cloud.Users.create({})
        }).shouldThrowException();
    },

    cloudUsersCreateEmptyUser: asyncTest({
   	    start: function(callback) {
   			var data = {};
   			Cloud.Users.create(data,
   				this.async(function(e) {
   					valueOf(e.success).shouldBeFalse();
   					valueOf(e.error).shouldBeTrue();
   			    })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for create response'
   	}),

    cloudUsersCreateNoPassword: asyncTest({
   	    start: function(callback) {
   			var data = {
                username: 'testuser'
            };
   			Cloud.Users.create(data,
   				this.async(function(e) {
   					valueOf(e.success).shouldBeFalse();
   					valueOf(e.error).shouldBeTrue();
   			    })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for create response'
   	}),

    cloudUsersCreateNoConfirmation: asyncTest({
   	    start: function(callback) {
   			var data = {
                username: 'testuser',
                password: 'password'
            };
   			Cloud.Users.create(data,
   				this.async(function(e) {
   					valueOf(e.success).shouldBeFalse();
   					valueOf(e.error).shouldBeTrue();
   			    })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for create response'
   	}),

    cloudUsersCreateMismatchedPassword: asyncTest({
   	    start: function(callback) {
   			var data = {
                username: 'testuser',
                password: 'password',
                password_confirmation: 'bad'
            };
   			Cloud.Users.create(data,
   				this.async(function(e) {
   					valueOf(e.success).shouldBeFalse();
   					valueOf(e.error).shouldBeTrue();
   			    })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for create response'
   	}),

    cloudUsersCreateNoUsername: asyncTest({
   	    start: function(callback) {
   			var data = {
                password: 'password',
                password_confirmation: 'password'
            };
   			Cloud.Users.create(data,
   				this.async(function(e) {
   					valueOf(e.success).shouldBeFalse();
   					valueOf(e.error).shouldBeTrue();
   			    })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for create response'
   	}),

    cloudUsersCreateEmailNoName: asyncTest({
   	    start: function(callback) {
   			var data = {
                email: 'testuser@appcelerator.com',
                password: 'password',
                password_confirmation: 'password'
            };
   			Cloud.Users.create(data,
   				this.async(function(e) {
   					valueOf(e.success).shouldBeFalse();
   					valueOf(e.error).shouldBeTrue();
   			    })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for create response'
   	}),

    cloudUsersCreateUserWithUserName: asyncTest({
   	    start: function(callback) {
   			var data = {
                username: 'testuser1',
                password: 'password',
                password_confirmation: 'password',
                tags: 'hiking, swimming'
            };
            this.sequence.push(function() { Cloud.Users.create(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                })
            )});
            this.sequence.push(function() { Cloud.Users.logout(
                this.async(function(e) {
            		valueOf(e.success).shouldBeTrue();
           		})
  			)});
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for create response'
   	}),

    cloudUsersCreateUserWithEMail: asyncTest({
   	    start: function(callback) {
   			var data = {
                email: 'testuser2@appcelerator.com',
                password: 'password',
                password_confirmation: 'password',
                first_name: 'test',
                last_name: 'user'
   			};
   			this.sequence.push(function() { Cloud.Users.create(data,
   				this.async(function(e) {
   					valueOf(e.success).shouldBeTrue();
   					valueOf(e.error).shouldBeFalse();
   			    })
            )});
            this.sequence.push(function() { Cloud.Users.logout(
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                })
            )});
        },
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for create response'
   	}),

    // Cloud.Users.login and Cloud.Users.logout
    cloudUsersLoginUserUnknownUser: asyncTest({
   	    start: function(callback) {
            var data = {
                login: 'tttt',
                password: 'password'
            };
            Cloud.Users.login(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeFalse();
                    valueOf(e.error).shouldBeTrue();
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for login response'
   	}),

    cloudUsersLoginUserBadPassword: asyncTest({
   	    start: function(callback) {
            var data = {
                login: 'testuser1',
                password: 'tttt'
            };
            Cloud.Users.login(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeFalse();
                    valueOf(e.error).shouldBeTrue();
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for login response'
   	}),

    cloudUsersLoginUser1: asyncTest({
        start: function(callback) {
            var data = {
                login: 'testuser1',
                password: 'password'
            };
            Cloud.Users.login(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.users[0].tags).shouldContain('hiking');
                    valueOf(e.users[0].tags).shouldContain('swimming');
                    valueOf(e.users[0].first_name).shouldBeUndefined();
                    valueOf(e.users[0].last_name).shouldBeUndefined();
                    // Save off the id for later test
                    callback.Users.ids.push(e.users[0].id);
                })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for login response'
    }),

    cloudUsersLogoutUser1: asyncTest({
        start: function(callback) {
            Cloud.Users.logout(
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for logout response'
    }),

    cloudUsersLoginUser2: asyncTest({
        start: function(callback) {
            var data = {
                login: 'testuser2@appcelerator.com',
                password: 'password'
            };
            Cloud.Users.login(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.users[0].tags).shouldBeUndefined();
                    valueOf(e.users[0].first_name).shouldBe('test');
                    valueOf(e.users[0].last_name).shouldBe('user');
                    // Save off the id for later test
                    callback.Users.ids.push(e.users[0].id);
                })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for login response'
    }),

    cloudUsersLogoutUser2: asyncTest({
        start: function(callback) {
            Cloud.Users.logout(
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for logout response'
    }),

    // Test switching user rapidly
    cloudUsersLoginlogout: asyncTest({
        start: function(callback) {
			this.sequence.push(function() { Cloud.Users.login({ login: 'testuser1', password: 'password'},
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
					valueOf(e.users[0].id).shouldBe(callback.Users.ids[0]);
				})
			)});
			this.sequence.push(function() { Cloud.Users.showMe(
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
					valueOf(e.users[0].id).shouldBe(callback.Users.ids[0]);
				})
			)});
			this.sequence.push(function() { Cloud.Users.logout(
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
				})
			)});
			this.sequence.push(function() { Cloud.Users.login({ login: 'testuser2@appcelerator.com', password: 'password'},
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
					valueOf(e.users[0].id).shouldBe(callback.Users.ids[1]);
				})
			)});
			this.sequence.push(function() { Cloud.Users.showMe(
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
					valueOf(e.users[0].id).shouldBe(callback.Users.ids[1]);
				})
			)});
			this.sequence.push(function() { Cloud.Users.logout(
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
				})
			)});			
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for response'
    }),

    // Cloud.Users.show
    cloudUsersShowUsers: asyncTest({
        start: function(callback) {
            var data = {
                user_ids: callback.Users.ids.toString()
            };
            Cloud.Users.show(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.users.length).shouldBe(2);
                    if (e.users[0].id == callback.Users.ids[0]) {
                        valueOf(e.users[0].username).shouldBe('testuser1');
                        valueOf(e.users[1].first_name).shouldBe('test');
                    } else {
                        valueOf(e.users[1].username).shouldBe('testuser1');
                        valueOf(e.users[0].first_name).shouldBe('test');
                    }
                })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for show response'
    }),

    // Cloud.Users.showMe and TiCloud.Users.update
    cloudUsersShowMeSetUp: asyncTest({
            start: function(callback) {
                var data = {
                    login: 'testuser1',
                    password: 'password'
                };
                Cloud.Users.login(data,
                    this.async(function(e) {
                        valueOf(e.success).shouldBeTrue();
                        valueOf(e.error).shouldBeFalse();
                    })
                );
            },
            timeout: 30000,
            timeoutError: 'Timed out waiting for login response'
        }),

    cloudUsersShowMe: asyncTest({
        start: function(callback) {
            Cloud.Users.showMe(
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.users[0].tags).shouldContain('hiking');
                    valueOf(e.users[0].tags).shouldContain('swimming');
                    valueOf(e.users[0].first_name).shouldBeUndefined();
                    valueOf(e.users[0].last_name).shouldBeUndefined();
                })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for showMe response'
    }),

    cloudUsersUpdateUser: asyncTest({
        start: function(callback) {
            var data = {
                first_name: 'joe',
                last_name: 'user',
                tags: 'golf, snowboarding',
                custom_fields: {
                    color: 'red',
                    number: 5
                }
            };
            Cloud.Users.update(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.users[0].tags).shouldContain('golf');
                    valueOf(e.users[0].tags).shouldContain('snowboarding');
                    valueOf(e.users[0].first_name).shouldBe('joe')
                    valueOf(e.users[0].last_name).shouldBe('user');
                    valueOf(e.users[0].custom_fields.color).shouldBe('red');
                    valueOf(e.users[0].custom_fields.number).shouldBe(5);
                })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for showMe response'

    }),

    // Cloud.Users.search
    cloudUsersSearchOneUser: asyncTest({
        start: function(callback) {
            var data = {
                q: 'golf'
            };
            Cloud.Users.search(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.users.length).shouldBe(1);
                    valueOf(e.users[0].tags).shouldContain('golf');
                    valueOf(e.users[0].first_name).shouldBe('joe');
                    valueOf(e.users[0].last_name).shouldBe('user');
                })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for search response'
    }),

    cloudUsersSearchPageTwoUser: asyncTest({
        start: function(callback) {
            var data = {
                q: 'user',
                page: 2,
                per_page: 1
            };
            Cloud.Users.search(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.users.length).shouldBe(1);
                    valueOf(e.users[0].last_name).shouldBe('user');
                    // Since we can't specify the order of results, we have no guarantee of which entry we got
                })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for search response'
    }),

    // Cloud.Users.query
    cloudUsersQueryOneUser: asyncTest({
        start: function(callback) {
            var data = {
                limit: 1,
                skip: 0,
                where: { color: 'red'}
            };
            Cloud.Users.query(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.users.length).shouldBe(1);
                    valueOf(e.users[0].tags).shouldContain('golf');
                    valueOf(e.users[0].first_name).shouldBe('joe');
                    valueOf(e.users[0].last_name).shouldBe('user');
                })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for search response'
    }),

    cloudUsersQueryOneUserIn: asyncTest({
        start: function(callback) {
            var data = {
                where: { color: { '$in':['blue','red'] } }
            };
            Cloud.Users.query(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.users.length).shouldBe(1);
                    valueOf(e.users[0].tags).shouldContain('golf');
                    valueOf(e.users[0].first_name).shouldBe('joe');
                    valueOf(e.users[0].last_name).shouldBe('user');
                })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for search response'
    }),

    // Cloud.Users.remove
    cloudUsersDeleteOneUser: asyncTest({
        start: function(callback) {
            // Must be logged in in order to delete
			this.sequence.push(function() { Cloud.Users.login({ login: 'testuser2@appcelerator.com', password: 'password'},
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
				})
			)});
			this.sequence.push(function() { Cloud.Users.remove(
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
				})
			)});
			this.sequence.push(function() { Cloud.Users.query({ where: { email: 'testuser2@appcelerator.com' } },
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
					valueOf(e.users.length).shouldBe(0);
				})
			)});
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for delete response'
    }),
	
    // Remove any users that we added to the database so it is back in its original state
    cloudUsersDeleteAllUsers: asyncTest({
        start: function(callback) {
            this.sequence.push(function() { Cloud.Users.login({ login: 'testuser1', password: 'password' },
                this.async(function(e) {
                    if (e.success) {
                        this.sequence.unshift(function() {
                            Cloud.Users.remove(
                                this.async(function(e) {
                                    valueOf(e.success).shouldBeTrue();
                                })
                            )
                        })
                    }
                })
            )});
            this.sequence.push(function() { Cloud.Users.login({ login: 'testuser2@appcelerator.com', password: 'password' },
                this.async(function(e) {
                    if (e.success) {
                        this.sequence.unshift(function() {
                            Cloud.Users.remove(
                                this.async(function(e) {
                                    valueOf(e.success).shouldBeTrue();
                                })
                            )
                        })
                    }
                })
            )});
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for delete response'
    }),

    // Cloud.Users.requestResetPassword
    // Requires manual effort and an e-mail account to test

    // ---------------------------------------------------------------
    // Cloud.Objects
    // ---------------------------------------------------------------

    // Test that all of the namespace APIs are available
    cloudObjectsApi: function() {
        // Verify that all of the methods are exposed
        this.verifyAPIs('Objects', [
            'create',
            'show',
            'update',
            'remove',
            'query'
        ]);
    },

	// Test that an object cannot be created when not logged in
    cloudObjectsCreateObjectNotLoggedIn: asyncTest({
	    start: function(callback) {
		    var data = {
                classname: 'cars',
			    make: 'mini',
				model: 'cooper',
				color: 'blue',
				year: 2012
			};
			Cloud.Objects.create(data,
			    this.async(function(e) {
				    valueOf(e.success).shouldBeFalse();
					valueOf(e.error).shouldBeTrue();
				})
			);
		},
		timeout: 30000,
		timeoutError: 'Timed out waiting for create response'
	}),

	// Log in for the following tests
    cloudObjectsLoginDrillbitUser: Utils.loginAsDrillbitUser,

	// Cloud.Objects.create
	// Test that an object can be created when logged in
    cloudObjectsCreateObjectLoggedIn: asyncTest({
	    start: function(callback) {
		    var data = {
                classname: 'cars',
                fields: {
                    make: 'mini',
                    model: 'cooper',
                    color: 'blue',
                    year: 2012,
                    drivers: [ 'joe', 'sue', 'johnny', 'alex' ],
                    options: {
                        leather: true,
                        heatedseats: false,
                        package: 'premium'
                    }
                }
			};
			Cloud.Objects.create(data,
			    this.async(function(e) {
				    valueOf(e.success).shouldBeTrue();
					valueOf(e.error).shouldBeFalse();
                    // Save off the id for later test
                    callback.Objects.ids.push(e.cars[0].id);
				})
			);
		},
		timeout: 30000,
		timeoutError: 'Timed out waiting for create response'
	}),

	// Test the creation of multiple objects in one pass
    cloudObjectsCreateMultipleObjects: asyncTest({
	    start: function(callback) {
			var count = 0;
			function cb(e) {
				if (e.success) {
					if (++count == 5) {
						callback.passed();
					}
				} else {
					callback.failed();
				}
			}
			for (var i=0; i<5; i++) {
				Cloud.Objects.create({ classname: 'test', fields: { name: 'test' + i } }, cb);
			}
		},
		timeout: 30000,
		timeoutError: 'Timed out waiting for create response'
	}),

	// Cloud.Objects.show
    cloudObjectsShowObject: asyncTest({
	    start: function(callback) {
        var data = {
                classname: 'cars',
                id: callback.Objects.ids[0]
            };

            Cloud.Objects.show(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.cars.length).shouldBe(1);
					valueOf(e.cars[0].id).shouldBe(callback.Objects.ids[0]);
					valueOf(e.cars[0].make).shouldBe('mini');
					valueOf(e.cars[0].model).shouldBe('cooper');
					valueOf(e.cars[0].color).shouldBe('blue');
					valueOf(e.cars[0].year).shouldBe(2012);
					valueOf(e.cars[0].drivers.length).shouldBe(4);
					valueOf(e.cars[0].options).shouldBeObject();
					valueOf(e.cars[0].options.leather).shouldBeTrue();
					valueOf(e.cars[0].options.heatedseats).shouldBeFalse();
					valueOf(e.cars[0].options.package).shouldBe('premium');
                })
            );
		},
		timeout: 30000,
		timeoutError: 'Timed out waiting for show response'
	}),

	// Cloud.Objects.update
    cloudObjectsUpdateObject: asyncTest({
	    start: function(callback) {
            var data = {
                classname: 'cars',
                id: callback.Objects.ids[0],
				fields: {
				    // add a field
					mileage: 10000,
					// update a field
					options: {
						leather: false,
						heatedseats: true,
						package: 'sport',
						// add a sub-field
						sunroof: true
					},
					// remove a field
					drivers: null
				}
            };
            Cloud.Objects.update(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.cars.length).shouldBe(1);
					valueOf(e.cars[0].id).shouldBe(callback.Objects.ids[0]);
					valueOf(e.cars[0].make).shouldBe('mini');
					valueOf(e.cars[0].model).shouldBe('cooper');
					valueOf(e.cars[0].color).shouldBe('blue');
					valueOf(e.cars[0].year).shouldBe(2012);
					valueOf(e.cars[0].drivers).shouldBeUndefined();
					valueOf(e.cars[0].options).shouldBeObject();
					valueOf(e.cars[0].options.leather).shouldBeFalse();
					valueOf(e.cars[0].options.heatedseats).shouldBeTrue();
					valueOf(e.cars[0].options.package).shouldBe('sport');
					valueOf(e.cars[0].options.sunroof).shouldBeTrue();
					valueOf(e.cars[0].mileage).shouldBe(10000);
                })
            );
		},
		timeout: 30000,
		timeoutError: 'Timed out waiting for update response'
	}),

	// Cloud.Objects.query
    cloudObjectsQueryOneObject: asyncTest({
        start: function(callback) {
            var data = {
                classname: 'cars',
                limit: 1,
                skip: 0,
                where: {
					user_id: callback.Utils.userId,
					mileage: { '$gt': 5000, '$lt': 15000 },
					color: 'blue'
				}
            };
			Cloud.Objects.query(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.cars.length).shouldBe(1);
					valueOf(e.cars[0].id).shouldBe(callback.Objects.ids[0]);
                })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for query response'
    }),

    cloudObjectsQueryMultipleObjects: asyncTest({
        start: function(callback) {
            var data = {
                classname: 'test',
                limit: 10,
                skip: 0,
				order: 'name',
                where: {
					name: { '$regex': 'test' },
					name: { '$ne': 'test0' }
				}
            };
            Cloud.Objects.query(data,
                this.async(function(e) {
                   valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.test.length).shouldBe(4);
					valueOf(e.test[0].name).shouldBe('test1');
					valueOf(e.test[1].name).shouldBe('test2');
					valueOf(e.test[2].name).shouldBe('test3');
					valueOf(e.test[3].name).shouldBe('test4');
                })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for query response'
    }),

    // Cloud.Objects.remove
    cloudObjectsDeleteAllCars: asyncTest({
        start: function(callback) {
			var carIds = [];
			this.sequence.push(function() { Cloud.Objects.query({ classname: 'cars' },
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
					valueOf(e.error).shouldBeFalse();
					for (var i=0; i<e.cars.length; i++) {
						carIds.push(e.cars[i].id);
					}
				})
			)});
			this.sequence.push(function() { Cloud.Objects.remove({ classname: 'cars' , ids: carIds.toString() },
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
					valueOf(e.error).shouldBeFalse();
				})
			)});
			this.sequence.push(function() { Cloud.Objects.query({ classname: 'cars' },
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
					valueOf(e.error).shouldBeFalse();
					valueOf(e.cars.length).shouldBe(0);
					valueOf(e.meta.total_results).shouldBe(0);
				})
			)});
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for remove response'
   	}),

    cloudObjectsDeleteAllTests: asyncTest({
        start: function(callback) {
			var testIds = [];
			this.sequence.push(function() { Cloud.Objects.query({ classname: 'test', limit: 100 },
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
					valueOf(e.error).shouldBeFalse();
					for (var i=0; i<e.test.length; i++) {
						testIds.push(e.test[i].id);
					}
				})
			)});
			this.sequence.push(function() { Cloud.Objects.remove({ classname: 'test', ids: testIds.toString() },
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
					valueOf(e.error).shouldBeFalse();
				})
			)});
			this.sequence.push(function() { Cloud.Objects.query({ classname: 'test' },
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
					valueOf(e.error).shouldBeFalse();
					valueOf(e.test.length).shouldBe(0);
					valueOf(e.meta.total_results).shouldBe(0);
				})
			)});
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for remove response'
   	}),


    // Done with the tests -- log out
    cloudObjectsLogoutDrillbitUser: Utils.logout,

    // ---------------------------------------------------------------
    // Cloud.Chats
    // ---------------------------------------------------------------

    // Test that all of the namespace APIs are available
    cloudChatsApi: function() {
        // Verify that all of the methods are exposed
        this.verifyAPIs('Chats', [
            'create',
            'query',
            'getChatGroups'
        ]);
    },

    cloudChatsCreate: asyncTest({
   	    start: function(callback) {
            // Get the userId of the chat user
            this.sequence.push(function() { Cloud.Users.login({ login: 'chatuser', password: 'password'},
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    callback.Chats.chatUserId = e.users[0].id;
                })
            )});
            this.sequence.push(function() { Cloud.Users.logout(
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                })
            )});
            this.sequence.push(function() { Cloud.Users.login({ login: 'drillbitUser', password: 'password'},
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    callback.Chats.userId = e.users[0].id;
                })
            )});
            this.sequence.push(function() { Cloud.Chats.create({ to_ids: callback.Chats.chatUserId, message: 'Hello'},
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.chats.length).shouldBe(1);
                    valueOf(e.chats[0].message).shouldBe('Hello');
                    valueOf(e.chats[0].from.id).shouldBe(callback.Chats.userId);
                    valueOf(e.chats[0].chat_group.participate_users.length).shouldBe(2);

                    callback.Chats.groupId = e.chats[0].chat_group.id;
                 })
             )});
            this.sequence.push(function() { Cloud.Users.logout(
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                })
            )});
        },
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for create response'
   	}),

    cloudChatsQuery: asyncTest({
   	    start: function(callback) {
            this.sequence.push(function() { Cloud.Users.login({ login: 'chatuser', password: 'password'},
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    callback.Chats.chatUserId = e.users[0].id;
                })
            )});
            // Get last message
            this.sequence.push(function() { Cloud.Chats.query({
                    chat_group_id: callback.Chats.groupId,
                    order: '-created_at',
                    page: 1,
                    per_page: 1
                },
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.chats.length).shouldBe(1);
                    valueOf(e.chats[0].message).shouldBe('Hello');
                    valueOf(e.chats[0].from.id).shouldBe(callback.Chats.userId);
                    valueOf(e.chats[0].chat_group.participate_users.length).shouldBe(2);
                    valueOf(e.chats[0].chat_group.id).shouldBe(callback.Chats.groupId);
                 })
            )});

            // NOTE: If the two chat messages are created too closely together then they can
            // get the same timestamp and when we retrieve them the order is indeterminate. So,
            // for testing we insert a slight delay so that the timestamps of the 2 messages
            // are spaced enough to make the retrieval by creation time determinate.
            this.sequence.push(function() {
                setTimeout(this.async(function() {}), 200);
            });

            // Send response
            this.sequence.push(function() { Cloud.Chats.create({ chat_group_id: callback.Chats.groupId, message: 'World'},
                 this.async(function(e) {
                     valueOf(e.success).shouldBeTrue();
                     valueOf(e.chats.length).shouldBe(1);
                     valueOf(e.chats[0].message).shouldBe('World');
                     valueOf(e.chats[0].from.id).shouldBe(callback.Chats.chatUserId);
                     valueOf(e.chats[0].chat_group.participate_users.length).shouldBe(2);
                 })
            )});
            this.sequence.push(function() { Cloud.Users.logout(
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                })
            )});
            this.sequence.push(function() { Cloud.Users.login({ login: 'drillbituser', password: 'password'},
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    callback.Chats.userId = e.users[0].id;
                })
            )});
            // Get last message
            this.sequence.push(function() { Cloud.Chats.query({
                    chat_group_id: callback.Chats.groupId,
                    order: '-created_at',
                    page: 1,
                    per_page: 2
                },
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.chats.length).shouldBe(2);
                    valueOf(e.chats[0].message).shouldBe('World');
                    valueOf(e.chats[1].message).shouldBe('Hello');
                    valueOf(e.chats[0].from.id).shouldBe(callback.Chats.chatUserId);
                    valueOf(e.chats[1].from.id).shouldBe(callback.Chats.userId);
                    valueOf(e.chats[0].chat_group.participate_users.length).shouldBe(2);
                    valueOf(e.chats[1].chat_group.participate_users.length).shouldBe(2);
                    valueOf(e.chats[0].chat_group.id).shouldBe(callback.Chats.groupId);
                    valueOf(e.chats[1].chat_group.id).shouldBe(callback.Chats.groupId);
                })
           )});
           this.sequence.push(function() { Cloud.Users.logout(
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                })
           )});
        },
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for query response'
   	}),

    cloudChatsMOD752: asyncTest({
   	    start: function(callback) {
            this.sequence.push(function() { Cloud.Users.login({ login: 'chatuser', password: 'password'},
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    callback.Chats.chatUserId = e.users[0].id;
                })
            )});
            // Issue query with '$gt' and '+' characters, using OAuth
            this.sequence.push(function() { Cloud.Chats.query({
                    chat_group_id: callback.Chats.groupId,
                    where: { updated_at: { '$gt': '2020-05-28T12:50:00+0000' } }
                },
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.chats.length).shouldBe(0);
                 })
            )});
           this.sequence.push(function() { Cloud.Users.logout(
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                })
           )});
        },
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for query response'
   	}),

    cloudChatsGetChatGroups: asyncTest({
   	    start: function(callback) {
            this.sequence.push(function() { Cloud.Users.login({ login: 'chatuser', password: 'password'},
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                })
            )});

            this.sequence.push(function() { Cloud.Chats.getChatGroups({
                    order: '-created_at'
                },
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.chat_groups.length).shouldBe(1);
                    valueOf(e.chat_groups[0].participate_users.length).shouldBe(2);
                 })
            )});

            this.sequence.push(function() { Cloud.Users.logout(
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                })
           )});
        },
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for getChatGroups response'
   	}),

    // ---------------------------------------------------------------
    // Cloud.SocialIntegrations
    // ---------------------------------------------------------------

    // Test that all of the namespace APIs are available
    cloudSocialIntegrationsApi: function() {
        // Verify that all of the methods are exposed
        this.verifyAPIs('SocialIntegrations', [
            'externalAccountLogin',
            'externalAccountLink',
            'externalAccountUnlink',
            'searchFacebookFriends'
        ]);
    },

    // NOTE: Further testing of Cloud.SocialIntegrations requires manual testing
    // as it relies on the creation of an external social network account

    // ---------------------------------------------------------------
    // Cloud.Places
    // ---------------------------------------------------------------

    // Test that all of the namespace APIs are available
    cloudPlacesApi: function() {
        // Verify that all of the methods are exposed
        this.verifyAPIs('Places', [
            'create',
            'search',
            'show',
            'update',
            'remove',
            'query'
        ]);
    },

    // Log in for the following tests
    cloudPlacesLoginDrillbitUser: Utils.loginAsDrillbitUser,

    cloudPlacesCreate: asyncTest({
   	    start: function(callback) {
   			var data = {
                name: 'Appcelerator HQ',
                address: '440 N. Bernardo Avenue',
                city: 'Mountain View',
                state: 'CA',
                postal_code: '94043',
                country: 'USA',
                website: 'http://www.appcelerator.com',
                phone_number: '650.200.4255',
                photo: Titanium.Filesystem.getFile('appcelerator.jpg'),
                tags: 'appcelerator, hq'
            };
   			Cloud.Places.create(data,
   				this.async(function(e) {
   					valueOf(e.success).shouldBeTrue();
   					valueOf(e.error).shouldBeFalse();
                    valueOf(e.places.length).shouldBe(1);
                    valueOf(e.places[0].name).shouldBe('Appcelerator HQ');
                    valueOf(e.places[0].photo).shouldBeObject();
                    callback.Places.ids.push(e.places[0].id);
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for create response'
   	}),

    cloudPlacesCreateAndSearch: asyncTest({
   	    start: function(callback) {
   			var data = {
                name: 'Apple HQ',
                address: '1 Infinite Loop',
                city: 'Cupertino',
                state: 'CA',
                postal_code: '95014',
                country: 'USA',
                website: 'http://www.apple.com',
                phone_number: '408-996-1010',
                photo: Titanium.Filesystem.getFile('apple_logo.jpg'),
                tags: 'apple, hq'
            };
            this.sequence.push(function() {	Cloud.Places.create(data,
   				this.async(function(e) {
   					valueOf(e.success).shouldBeTrue();
   					valueOf(e.error).shouldBeFalse();
                    valueOf(e.places.length).shouldBe(1);
                    valueOf(e.places[0].name).shouldBe('Apple HQ');
                    valueOf(e.places[0].photo).shouldBeObject();
                    callback.Places.ids.push(e.places[0].id);
                })
            )});
            this.sequence.push(function() { Cloud.Places.search(
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
               	    valueOf(e.error).shouldBeFalse();
                    valueOf(e.places.length).shouldBe(2);
                })
            )});
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for search response'
   	}),

    cloudPlacesSearchByKeyword: asyncTest({
   	    start: function(callback) {
            var data = {
                q: 'Appcelerator'
            };
            Cloud.Places.search(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
               	    valueOf(e.error).shouldBeFalse();
                    valueOf(e.places.length).shouldBe(1);
                    valueOf(e.places[0].name).shouldBe('Appcelerator HQ');
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for search response'
   	}),

    cloudPlacesShow: asyncTest({
   	    start: function(callback) {
            var data = {
                place_id: callback.Places.ids[0]
            };
            Cloud.Places.show(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
               	    valueOf(e.error).shouldBeFalse();
                    valueOf(e.places.length).shouldBe(1);
                    valueOf(e.places[0].name).shouldBe('Appcelerator HQ');
                    valueOf(e.places[0].id).shouldBe(callback.Places.ids[0]);
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for show response'
   	}),

    cloudPlacesUpdate: asyncTest({
   	    start: function(callback) {
            var data = {
                place_id: callback.Places.ids[0],
                twitter: 'appcelerator',
                name: 'APPCELERATOR HQ'
            };
            Cloud.Places.update(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
               	    valueOf(e.error).shouldBeFalse();
                    valueOf(e.places.length).shouldBe(1);
                    valueOf(e.places[0].name).shouldBe('APPCELERATOR HQ');
                    valueOf(e.places[0].id).shouldBe(callback.Places.ids[0]);
                    valueOf(e.places[0].twitter).shouldBe('appcelerator');
                    valueOf(e.places[0].city).shouldBe('Mountain View');
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for update response'
   	}),

    cloudPlacesQuery: asyncTest({
        start: function(callback) {
            var data = {
                where: {
                    city: { '$in': [ 'Mountain View', 'Cupertino' ] }
                }
            };
            Cloud.Places.query(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.places.length).shouldBe(2);
                    valueOf(e.places[0].id).shouldBeOneOf(callback.Places.ids);
                    valueOf(e.places[1].id).shouldBeOneOf(callback.Places.ids);
                 })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for search response'
    }),

    cloudPlacesQueryAndDeleteAll: asyncTest({
        start: function(callback) {
            var ids = [];
			this.sequence.push(function() { Cloud.Places.query(
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
					valueOf(e.error).shouldBeFalse();
					for (var i=0; i<e.places.length; i++) {
                        ids.push(e.places[i].id);
						this.sequence.unshift(function() { Cloud.Places.remove({
                                place_id: ids.pop()
                            },
                            this.async(function(e) {
                                valueOf(e.success).shouldBeTrue();
                                valueOf(e.error).shouldBeFalse();
                            })
                        )});
					}
				})
			)});
			this.sequence.push(function() { Cloud.Places.query(
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
					valueOf(e.error).shouldBeFalse();
					valueOf(e.places.length).shouldBe(0);
					valueOf(e.meta.total_results).shouldBe(0);
				})
			)});
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for remove response'
   	}),

    cloudPlacesLogoutDrillbitUser: Utils.logout,

    // ---------------------------------------------------------------
    // Cloud.Checkins
    // ---------------------------------------------------------------

    // Test that all of the namespace APIs are available
    cloudCheckinApi: function() {
        // Verify that all of the methods are exposed
        this.verifyAPIs('Checkins', [
            'create',
            'query',
            'show',
            'remove'
        ]);
    },

    // Log in for the following tests
    cloudCheckinsLoginDrillbitUser: Utils.loginAsDrillbitUser,

    cloudCheckinsCreate: asyncTest({
   	    start: function(callback) {
           var data = {
                 name: 'Appcelerator HQ',
                 address: '440 N. Bernardo Avenue',
                 city: 'Mountain View',
                 state: 'CA',
                 postal_code: '94043',
                 country: 'USA',
                 website: 'http://www.appcelerator.com',
                 phone_number: '650.200.4255',
                 photo: Titanium.Filesystem.getFile('appcelerator.jpg'),
                 tags: 'appcelerator, hq'
            };
            this.sequence.push(function() {	Cloud.Places.create(data,
   				this.async(function(e) {
                   valueOf(e.success).shouldBeTrue();
                   valueOf(e.error).shouldBeFalse();
                   valueOf(e.places.length).shouldBe(1);
                   valueOf(e.places[0].name).shouldBe('Appcelerator HQ');
                   valueOf(e.places[0].photo).shouldBeObject();
                   callback.Checkins.placeId = e.places[0].id;
                })
            )});
            this.sequence.push(function() { Cloud.Checkins.create({
                    place_id: callback.Checkins.placeId,
                    message: 'I am here',
                    tags: 'HQ, work',
                    custom_fields: {
                        project: 'ACS',
                        test: 'DrillBit'
                    }
                },
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
               	    valueOf(e.error).shouldBeFalse();
                    valueOf(e.checkins.length).shouldBe(1);
                    valueOf(e.checkins[0].message).shouldBe('I am here');
                    valueOf(e.checkins[0].place.id).shouldBe(callback.Checkins.placeId);
                    valueOf(e.checkins[0].place.name).shouldBe('Appcelerator HQ');
                    valueOf(e.checkins[0].user.id).shouldBe(callback.Utils.userId);
                    valueOf(e.checkins[0].tags).shouldContain('HQ');
                    valueOf(e.checkins[0].tags).shouldContain('work');
                    valueOf(e.checkins[0].custom_fields).shouldBeObject();
                    valueOf(e.checkins[0].custom_fields.project).shouldBe('ACS');
                    valueOf(e.checkins[0].custom_fields.test).shouldBe('DrillBit');
                    callback.Checkins.checkinId = e.checkins[0].id;
                })
            )});
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for create response'
   	}),

    cloudCheckinsQuery: asyncTest({
        start: function(callback) {
            Cloud.Checkins.query(
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.checkins.length).shouldBe(1);
                    valueOf(e.checkins[0].place.id).shouldBe(callback.Checkins.placeId);
                    valueOf(e.checkins[0].message).shouldBe('I am here');
                    valueOf(e.checkins[0].user.id).shouldBe(callback.Utils.userId);
                })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for query response'
    }),

    cloudCheckinsShow: asyncTest({
   	    start: function(callback) {
            var data = {
                checkin_id: callback.Checkins.checkinId
            };
            Cloud.Checkins.show(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
               	    valueOf(e.error).shouldBeFalse();
                    valueOf(e.checkins.length).shouldBe(1);
                    valueOf(e.checkins[0].place.id).shouldBe(callback.Checkins.placeId);
                    valueOf(e.checkins[0].message).shouldBe('I am here');
                    valueOf(e.checkins[0].user.id).shouldBe(callback.Utils.userId);
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for show response'
   	}),

    cloudCheckinsDelete: asyncTest({
        start: function(callback) {
            var data = {
                checkin_id: callback.Checkins.checkinId
            };
			this.sequence.push(function() { Cloud.Checkins.remove(data,
				this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
					valueOf(e.error).shouldBeFalse();
				})
			)});
			this.sequence.push(function() { Cloud.Checkins.query(
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
					valueOf(e.error).shouldBeFalse();
					valueOf(e.checkins.length).shouldBe(0);
					valueOf(e.meta.total_results).shouldBe(0);
				})
			)});
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for remove response'
   	}),

    cloudCheckinsCleanup: asyncTest({
        start: function(callback) {
            var data = {
                place_id: callback.Checkins.placeId
            };
            Cloud.Places.remove( data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for remove response'
   	}),

    cloudCheckinsLogoutDrillbitUser: Utils.logout,

    // ---------------------------------------------------------------
    // Cloud.Statuses
    // ---------------------------------------------------------------

    // Test that all of the namespace APIs are available
    cloudStatusesApi: function() {
        // Verify that all of the methods are exposed
        this.verifyAPIs('Statuses', [
            'create',
            'search',
            'query'
        ]);
    },

    // Log in for the following tests
    cloudStatusesLoginDrillbitUser: Utils.loginAsDrillbitUser,

    cloudStatusesCreateMultiple: asyncTest({
   	    start: function(callback) {
            this.sequence.push(function() {	Cloud.Statuses.create({ message: 'Sleeping' },
   				this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.statuses.length).shouldBe(1);
                    valueOf(e.statuses[0].message).shouldBe('Sleeping');
                    // Grab the creation time of the first status that we create during this test so
                    // we can query all statuses created by this test since there isn't a way to
                    // delete them later from the database.
                    callback.Statuses.startTime = callback.convertISOToDate(e.statuses[0].created_at);
                    callback.Statuses.startTime.setSeconds(callback.Statuses.startTime.getSeconds() - 10);
                 })
            )});
            this.sequence.push(function() {	Cloud.Statuses.create({ message: 'Awake' },
                this.async(function(e) {
                   valueOf(e.success).shouldBeTrue();
                   valueOf(e.error).shouldBeFalse();
                   valueOf(e.statuses.length).shouldBe(1);
                   valueOf(e.statuses[0].message).shouldBe('Awake');
               })
            )});
            this.sequence.push(function() {	Cloud.Statuses.create({ message: 'Idle' },
               this.async(function(e) {
                  valueOf(e.success).shouldBeTrue();
                  valueOf(e.error).shouldBeFalse();
                  valueOf(e.statuses.length).shouldBe(1);
                  valueOf(e.statuses[0].message).shouldBe('Idle');
               })
            )});
        },
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for create response'
   	}),

    cloudStatusesSearch: asyncTest({
        start: function(callback) {
            var data = {
                user_id: callback.Utils.userId,
                start_time: callback.Statuses.startTime
            };
            Cloud.Statuses.search(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.statuses.length).shouldBe(3);
                })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for show response'
    }),

    cloudStatusesQuery: asyncTest({
        start: function(callback) {
            var data = {
                where: {
                    user_id: callback.Utils.userId,
                    created_at: { '$gt': callback.Statuses.startTime }
                },
                order: '-created_at'
            };
            Cloud.Statuses.query(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.statuses.length).shouldBe(3);
                })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for query response'
   	}),

    cloudStatusesLogoutDrillbitUser: Utils.logout,

    // ---------------------------------------------------------------
    // Cloud.Photos
    // ---------------------------------------------------------------

    // Test that all of the namespace APIs are available
    cloudPhotosApi: function() {
        // Verify that all of the methods are exposed
        this.verifyAPIs('Photos', [
            'create',
            'show',
            'search',
            'query',
            'update',
            'remove'
        ]);
    },

    // Log in for the following tests
    cloudPhotosLoginDrillbitUser: Utils.loginAsDrillbitUser,

    cloudPhotosCreate: asyncTest({
   	    start: function(callback) {
   			var data = {
                photo: Titanium.Filesystem.getFile('appcelerator.jpg'),
                tags: 'appcelerator, logo',
                'photo_sizes[preview]': '100x100#',
                'photo_sync_sizes[]': 'preview'
            };
   			Cloud.Photos.create(data,
   				this.async(function(e) {
   					valueOf(e.success).shouldBeTrue();
   					valueOf(e.error).shouldBeFalse();
                    valueOf(e.photos.length).shouldBe(1);
                    callback.Photos.ids.push(e.photos[0].id);
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for create response'
   	}),

    cloudPhotosCreateAndSearch: asyncTest({
   	    start: function(callback) {
   			var data = {
                photo: Titanium.Filesystem.getFile('apple_logo.jpg'),
                tags: 'apple, logo',
                'photo_sizes[preview]': '100x100#',
                'photo_sync_sizes[]': 'preview'
            };
            this.sequence.push(function() {	Cloud.Photos.create(data,
   				this.async(function(e) {
   					valueOf(e.success).shouldBeTrue();
   					valueOf(e.error).shouldBeFalse();
                    valueOf(e.photos.length).shouldBe(1);
                    callback.Photos.ids.push(e.photos[0].id);
                })
            )});
            this.sequence.push(function() { Cloud.Photos.search({ user_id: callback.Utils.userId },
               this.async(function(e) {
                   valueOf(e.success).shouldBeTrue();
                   valueOf(e.error).shouldBeFalse();
                   valueOf(e.photos.length).shouldBe(2);
                   valueOf(e.photos[0].id).shouldBeOneOf(callback.Photos.ids);
                   valueOf(e.photos[1].id).shouldBeOneOf(callback.Photos.ids);
               })
            )});   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for search response'
   	}),

    cloudPhotosShow: asyncTest({
   	    start: function(callback) {
            var data = {
                photo_id: callback.Photos.ids[0]
            };
            Cloud.Photos.show(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
               	    valueOf(e.error).shouldBeFalse();
                    valueOf(e.photos.length).shouldBe(1);
                    valueOf(e.photos[0].id).shouldBe(callback.Photos.ids[0]);
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for show response'
   	}),

    cloudPhotosUpdate: asyncTest({
   	    start: function(callback) {
            var data = {
                photo_id: callback.Photos.ids[0],
                tags: 'appcelerator, logo, test',
                custom_data_fields: {
                    year: 2012
                },
                'photo_sizes[preview]': '100x100#',
                'photo_sync_sizes[]': 'preview'
            };
            // NOTE: We need to wait a little bit for the photos to be processed. So,
            // for testing we insert a slight delay so that the photos can be processed
            this.sequence.push(function() {
                setTimeout(this.async(function() {}), 5000);
            });
            this.sequence.push(function() { Cloud.Photos.update(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
               	    valueOf(e.error).shouldBeFalse();
                    valueOf(e.photos.length).shouldBe(1);
                    valueOf(e.photos[0].id).shouldBe(callback.Photos.ids[0]);
                    valueOf(e.photos[0].tags).shouldContain('appcelerator');
                    valueOf(e.photos[0].tags).shouldContain('logo');
                    valueOf(e.photos[0].tags).shouldContain('test');
                })
            )});
   		},
   		timeout: 15000,
   		timeoutError: 'Timed out waiting for update response'
   	}),

    cloudPhotosQuery: asyncTest({
        start: function(callback) {
            Cloud.Photos.query(
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.photos.length).shouldBe(2);
                    valueOf(e.photos[0].id).shouldBeOneOf(callback.Photos.ids);
                    valueOf(e.photos[1].id).shouldBeOneOf(callback.Photos.ids);
                 })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for query response'
    }),

    cloudPhotosQueryAndDeleteAll: asyncTest({
        start: function(callback) {
            var ids = [];
			this.sequence.push(function() { Cloud.Photos.query(
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
					valueOf(e.error).shouldBeFalse();
					for (var i=0; i<e.photos.length; i++) {
                        ids.push(e.photos[i].id);
						this.sequence.unshift(function() { Cloud.Photos.remove({
                                photo_id: ids.pop()
                            },
                            this.async(function(e) {
                                valueOf(e.success).shouldBeTrue();
                                valueOf(e.error).shouldBeFalse();
                            })
                        )});
					}
				})
			)});
            // NOTE: We need to wait a little bit for the photos to be processed. So,
            // for testing we insert a slight delay so that the photos can be processed
            this.sequence.push(function() {
                setTimeout(this.async(function() {}), 5000);
            });
			this.sequence.push(function() { Cloud.Photos.query(
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
					valueOf(e.error).shouldBeFalse();
					valueOf(e.photos.length).shouldBe(0);
					valueOf(e.meta.total_results).shouldBe(0);
				})
			)});
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for remove response'
   	}),


    cloudPhotosLogoutDrillbitUser: Utils.logout,

    // ---------------------------------------------------------------
    // Cloud.PushNotifications
    // ---------------------------------------------------------------

       // Test that all of the namespace APIs are available
    cloudPushNotificationsApi: function() {
        // Verify that all of the methods are exposed
        this.verifyAPIs('PushNotifications', [
            'subscribe',
            'unsubscribe',
            'notify'
        ]);
    },

	// Log in for the following tests
    cloudPushNotificationsLoginDrillbitUser: Utils.loginAsDrillbitUser,

    // Register for push notifications
    cloudPushNotificationsNotify: asyncTest({
        start: function(callback) {
            var data = {
                channel: 'test',
                device_token: "not-a-real-token",
                type: Ti.Platform.name === 'iPhone OS' ? 'ios' : Ti.Platform.name
            };
            this.sequence.push(function() { Cloud.PushNotifications.subscribe(data,
                this.async(function(e) {
                    // Should be false because push notifications are not configured in the application settings
                    valueOf(e.success).shouldBeFalse();
                    valueOf(e.error).shouldBeTrue();
                })
            )});
            this.sequence.push(function() { Cloud.PushNotifications.notify({ channel: data.channel, payload: 'Hello World' },
                this.async(function(e) {
                    // Should be false because push notifications are not configured in the application settings
                    valueOf(e.success).shouldBeFalse();
                    valueOf(e.error).shouldBeTrue();
                })
            )});
            this.sequence.push(function() { Cloud.PushNotifications.unsubscribe({ channel: data.channel, device_token: data.deviceToken },
                this.async(function(e) {
                    // Should be false because push notifications are not configured in the application settings
                    valueOf(e.success).shouldBeFalse();
                    valueOf(e.error).shouldBeTrue();
                })
            )});
        },
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for push notification'
   	}),

    // Done with the tests -- log out
    cloudPushNotificationsLogoutDrillbitUser: Utils.logout,

    // ---------------------------------------------------------------
    // Cloud.KeyValues
    // ---------------------------------------------------------------

    // Test that all of the namespace APIs are available
    cloudKeyValuesApi: function() {
        // Verify that all of the methods are exposed
        this.verifyAPIs('KeyValues', [
            'set',
            'get',
            'append',
            'increment',
            'remove'
        ]);
    },

    // Log in for the following tests
    cloudKeyValuesLoginDrillbitUser: Utils.loginAsDrillbitUser,

    cloudKeyValuesSetMultiple: asyncTest({
   	    start: function(callback) {
            this.sequence.push(function() {	Cloud.KeyValues.set({
                    name: 'test1',
                    value: 'Hello World'
                },
   				this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                 })
            )});
            this.sequence.push(function() {	Cloud.KeyValues.set({
                   name: 'test2',
                   value: '100'
                },
                this.async(function(e) {
                   valueOf(e.success).shouldBeTrue();
                   valueOf(e.error).shouldBeFalse();
                })
            )});
            this.sequence.push(function() {	Cloud.KeyValues.set({
                  name: 'test3',
                  value: 'Hello'
               },
               this.async(function(e) {
                  valueOf(e.success).shouldBeTrue();
                  valueOf(e.error).shouldBeFalse();
               })
            )});
        },
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for set response'
   	}),

    cloudKeyValuesGet: asyncTest({
        start: function(callback) {
            var data = {
                name: 'test1'
            };
            Cloud.KeyValues.get(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.keyvalues.length).shouldBe(1);
                    valueOf(e.keyvalues[0].name).shouldBe('test1');
                    valueOf(e.keyvalues[0].value).shouldBe('Hello World');
                })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for get response'
    }),

    cloudKeyValuesAppend: asyncTest({
        start: function(callback) {
            var data = {
                name: 'test3',
                value: ', Drillbit'
            };
            Cloud.KeyValues.append(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.keyvalues.length).shouldBe(1);
                    valueOf(e.keyvalues[0].name).shouldBe('test3');
                    valueOf(e.keyvalues[0].value).shouldBe('Hello, Drillbit');
                })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for append response'
   	}),

    cloudKeyValuesIncrement: asyncTest({
        start: function(callback) {
            var data = {
                name: 'test2',
                value: 10
            };
            Cloud.KeyValues.increment(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.keyvalues.length).shouldBe(1);
                    valueOf(e.keyvalues[0].name).shouldBe('test2');
                    valueOf(e.keyvalues[0].value).shouldBe(110);
                })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for increment response'
   	}),

    cloudKeyValuesDeleteAll: asyncTest({
   	    start: function(callback) {
            this.sequence.push(function() {	Cloud.KeyValues.remove({
                    name: 'test1'
                },
   				this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                 })
            )});
            this.sequence.push(function() {	Cloud.KeyValues.remove({
                   name: 'test2'
                },
                this.async(function(e) {
                   valueOf(e.success).shouldBeTrue();
                   valueOf(e.error).shouldBeFalse();
                })
            )});
            this.sequence.push(function() {	Cloud.KeyValues.remove({
                  name: 'test3'
               },
               this.async(function(e) {
                  valueOf(e.success).shouldBeTrue();
                  valueOf(e.error).shouldBeFalse();
               })
            )});
            this.sequence.push(function() {	Cloud.KeyValues.get({
                   name: 'test1'
               },
                this.async(function(e) {
                   valueOf(e.success).shouldBeFalse();
                   valueOf(e.error).shouldBeTrue();
                })
            )});
            this.sequence.push(function() {	Cloud.KeyValues.get({
                  name: 'test2'
               },
               this.async(function(e) {
                  valueOf(e.success).shouldBeFalse();
                  valueOf(e.error).shouldBeTrue();
               })
            )});
            this.sequence.push(function() {	Cloud.KeyValues.get({
                 name: 'test3'
              },
              this.async(function(e) {
                 valueOf(e.success).shouldBeFalse();
                 valueOf(e.error).shouldBeTrue();
              })
            )});
        },
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for remove response'
   	}),

    cloudKeyValueLogoutDrillbitUser: Utils.logout,

    // ---------------------------------------------------------------
    // Cloud.Posts
    // ---------------------------------------------------------------

    // Test that all of the namespace APIs are available
    cloudPostsApi: function() {
        // Verify that all of the methods are exposed
        this.verifyAPIs('Posts', [
            'create',
            'show',
            'query',
            'update',
            'remove'
        ]);
    },

    // Log in for the following tests
    cloudPostsLoginDrillbitUser: Utils.loginAsDrillbitUser,

    cloudPostsCreate: asyncTest({
   	    start: function(callback) {
   			var data = {
                content: 'Welcome to Drillbit',
                title: 'Welcome',
                photo: Titanium.Filesystem.getFile('appcelerator.jpg')
            };
   			Cloud.Posts.create(data,
   				this.async(function(e) {
   					valueOf(e.success).shouldBeTrue();
   					valueOf(e.error).shouldBeFalse();
                    valueOf(e.posts.length).shouldBe(1);
                    valueOf(e.posts[0].title).shouldBe('Welcome');
                    valueOf(e.posts[0].content).shouldBe('Welcome to Drillbit');
                    valueOf(e.posts[0].photo).shouldBeObject();
                    valueOf(e.posts[0].user.id).shouldBe(callback.Utils.userId);
                    callback.Posts.ids.push(e.posts[0].id);
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for create response'
   	}),

    cloudPostsCreateAndShow: asyncTest({
   	    start: function(callback) {
   			var data = {
                content: 'Welcome to Hawaii',
                title: 'Aloha'
            };
            this.sequence.push(function() {	Cloud.Posts.create(data,
   				this.async(function(e) {
   					valueOf(e.success).shouldBeTrue();
   					valueOf(e.error).shouldBeFalse();
                    valueOf(e.posts.length).shouldBe(1);
                    valueOf(e.posts[0].title).shouldBe('Aloha');
                    valueOf(e.posts[0].content).shouldBe('Welcome to Hawaii');
                    callback.Posts.ids.push(e.posts[0].id);
                })
            )});
            this.sequence.push(function() { Cloud.Posts.show({
                    post_id: callback.Posts.ids[0]
                },
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
               	    valueOf(e.error).shouldBeFalse();
                    valueOf(e.posts.length).shouldBe(1);
                    valueOf(e.posts[0].id).shouldBe(callback.Posts.ids[0]);
                    valueOf(e.posts[0].title).shouldBe('Welcome');
                    valueOf(e.posts[0].content).shouldBe('Welcome to Drillbit');
                    valueOf(e.posts[0].photo).shouldBeObject();
                    valueOf(e.posts[0].user.id).shouldBe(callback.Utils.userId);
                })
            )});
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for show response'
   	}),

    cloudPostsShow: asyncTest({
   	    start: function(callback) {
            var data = {
                post_ids: callback.Posts.ids.toString()
            };
            Cloud.Posts.show(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
               	    valueOf(e.error).shouldBeFalse();
                    valueOf(e.posts.length).shouldBe(2);
                    valueOf(e.posts[0].id).shouldBeOneOf(callback.Posts.ids);
                    valueOf(e.posts[1].id).shouldBeOneOf(callback.Posts.ids);
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for show response'
   	}),

    cloudPostsUpdate: asyncTest({
   	    start: function(callback) {
            var data = {
                post_id: callback.Posts.ids[1],
                content: 'Welcome to the Hawaiian Islands'
            };
            Cloud.Posts.update(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
               	    valueOf(e.error).shouldBeFalse();
                    valueOf(e.posts.length).shouldBe(1);
                    valueOf(e.posts[0].id).shouldBe(callback.Posts.ids[1]);
                    valueOf(e.posts[0].title).shouldBe('Aloha');
                    valueOf(e.posts[0].content).shouldBe('Welcome to the Hawaiian Islands');
                    valueOf(e.posts[0].user.id).shouldBe(callback.Utils.userId);
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for update response'
   	}),

    cloudPostsQuery: asyncTest({
        start: function(callback) {
            var data = {
                where: {
                    title: 'Welcome'
                }
            };
            Cloud.Posts.query(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.posts.length).shouldBe(1);
                    valueOf(e.posts[0].title).shouldBe('Welcome');
                    valueOf(e.posts[0].content).shouldBe('Welcome to Drillbit');
                    valueOf(e.posts[0].photo).shouldBeObject();
                    valueOf(e.posts[0].user.id).shouldBe(callback.Utils.userId);
                 })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for search response'
    }),

    cloudPostsQueryAndDeleteAll: asyncTest({
        start: function(callback) {
            var ids = [];
			this.sequence.push(function() { Cloud.Posts.query(
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
					valueOf(e.error).shouldBeFalse();
					for (var i=0; i<e.posts.length; i++) {
                        ids.push(e.posts[i].id);
						this.sequence.unshift(function() { Cloud.Posts.remove({
                                post_id: ids.pop()
                            },
                            this.async(function(e) {
                                valueOf(e.success).shouldBeTrue();
                                valueOf(e.error).shouldBeFalse();
                            })
                        )});
					}
				})
			)});
			this.sequence.push(function() { Cloud.Posts.query(
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
					valueOf(e.error).shouldBeFalse();
					valueOf(e.posts.length).shouldBe(0);
					valueOf(e.meta.total_results).shouldBe(0);
				})
			)});
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for remove response'
   	}),

    cloudPostsLogoutDrillbitUser: Utils.logout,

    // ---------------------------------------------------------------
    // Cloud.Reviews
    // ---------------------------------------------------------------

    // Test that all of the namespace APIs are available
    cloudReviewsApi: function() {
        // Verify that all of the methods are exposed
        this.verifyAPIs('Reviews', [
            'create',
            'show',
            'query',
            'update',
            'remove'
        ]);
    },

    // Log in for the following tests
    cloudReviewsLoginDrillbitUser: Utils.loginAsDrillbitUser,

    cloudReviewsCreate: asyncTest({
   	    start: function(callback) {
   			var data = {
                user_id: callback.Utils.userId,
                content: 'Good',
                rating: 5,
                allow_duplicate: 1
            };
   			Cloud.Reviews.create(data,
   				this.async(function(e) {
   					valueOf(e.success).shouldBeTrue();
   					valueOf(e.error).shouldBeFalse();
                    valueOf(e.reviews.length).shouldBe(1);
                    valueOf(e.reviews[0].content).shouldBe('Good');
                    valueOf(e.reviews[0].rating).shouldBe(5);
                    valueOf(e.reviews[0].user.id).shouldBe(callback.Utils.userId);
                    callback.Reviews.ids.push(e.reviews[0].id);
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for create response'
   	}),

    cloudReviewsCreateAndShow: asyncTest({
   	    start: function(callback) {
            var data = {
                content: 'Welcome to Hawaii',
                title: 'Aloha'
            };
            this.sequence.push(function() {	Cloud.Posts.create(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.posts.length).shouldBe(1);
                    valueOf(e.posts[0].title).shouldBe('Aloha');
                    valueOf(e.posts[0].content).shouldBe('Welcome to Hawaii');
                    callback.Reviews.postId = e.posts[0].id;
                })
            )});
            this.sequence.push(function() {	Cloud.Reviews.create({
                    post_id: callback.Reviews.postId,
                    content: 'Review of Hawaii',
                    rating: 10,
                    allow_duplicate: 1
               },
               this.async(function(e) {
                   valueOf(e.success).shouldBeTrue();
                   valueOf(e.error).shouldBeFalse();
                   valueOf(e.reviews.length).shouldBe(1);
                   valueOf(e.reviews[0].content).shouldBe('Review of Hawaii');
                   valueOf(e.reviews[0].rating).shouldBe(10);
                   callback.Reviews.ids.push(e.reviews[0].id);
               })
            )});
            this.sequence.push(function() {	Cloud.Reviews.create({
                   post_id: callback.Reviews.postId,
                   content: 'Another Review of Hawaii',
                   rating: 20,
                   allow_duplicate: 1
              },
              this.async(function(e) {
                  valueOf(e.success).shouldBeTrue();
                  valueOf(e.error).shouldBeFalse();
                  valueOf(e.reviews.length).shouldBe(1);
                  valueOf(e.reviews[0].content).shouldBe('Another Review of Hawaii');
                  valueOf(e.reviews[0].rating).shouldBe(20);
                  callback.Reviews.ids.push(e.reviews[0].id);
              })
            )});
            this.sequence.push(function() { Cloud.Reviews.show({
                    post_id: callback.Reviews.postId,
                    review_id: callback.Reviews.ids[1]
                },
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
               	    valueOf(e.error).shouldBeFalse();
                    valueOf(e.reviews.length).shouldBe(1);
                    valueOf(e.reviews[0].id).shouldBe(callback.Reviews.ids[1]);
                    valueOf(e.reviews[0].content).shouldBe('Review of Hawaii');
                    valueOf(e.reviews[0].rating).shouldBe(10);
                    valueOf(e.reviews[0].user.id).shouldBe(callback.Utils.userId);
                })
            )});
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for show response'
   	}),

    cloudReviewsShow: asyncTest({
   	    start: function(callback) {
            var data = {
                user_id: callback.Utils.userId,
                review_id: callback.Reviews.ids[0]
            };
            Cloud.Reviews.show(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
               	    valueOf(e.error).shouldBeFalse();
                    valueOf(e.reviews.length).shouldBe(1);
                    valueOf(e.reviews[0].content).shouldBe('Good');
                    valueOf(e.reviews[0].rating).shouldBe(5);
                    valueOf(e.reviews[0].user.id).shouldBe(callback.Utils.userId);
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for show response'
   	}),

    cloudReviewsUpdate: asyncTest({
   	    start: function(callback) {
            var data = {
                post_id: callback.Reviews.postId,
                review_id: callback.Reviews.ids[1],
                content: 'It is a great day in Hawaii',
                rating: 100
            };
            Cloud.Reviews.update(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
               	    valueOf(e.error).shouldBeFalse();
                    valueOf(e.reviews.length).shouldBe(1);
                    valueOf(e.reviews[0].id).shouldBe(callback.Reviews.ids[1]);
                    valueOf(e.reviews[0].content).shouldBe('It is a great day in Hawaii');
                    valueOf(e.reviews[0].rating).shouldBe(100);
                    valueOf(e.reviews[0].user.id).shouldBe(callback.Utils.userId);
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for update response'
   	}),

    cloudReviewsQuery: asyncTest({
        start: function(callback) {
            var data = {
                post_id: callback.Reviews.postId,
                where: {
                    rating: { '$gte': 50 }
                }
            };
            Cloud.Reviews.query(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.reviews.length).shouldBe(1);
                    valueOf(e.reviews[0].id).shouldBe(callback.Reviews.ids[1]);
                    valueOf(e.reviews[0].content).shouldBe('It is a great day in Hawaii');
                    valueOf(e.reviews[0].rating).shouldBe(100);
                    valueOf(e.reviews[0].user.id).shouldBe(callback.Utils.userId);
                 })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for search response'
    }),

    cloudReviewsQueryAndDeleteAll: asyncTest({
        start: function(callback) {
            var ids = [];
			this.sequence.push(function() { Cloud.Reviews.query({
                    user_id: callback.Utils.userId
                },
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
					valueOf(e.error).shouldBeFalse();
					for (var i=0; i<e.reviews.length; i++) {
                        ids.push(e.reviews[i].id);
						this.sequence.unshift(function() { Cloud.Reviews.remove({
                                review_id: ids.pop(),
                                user_id: callback.Utils.userId
                            },
                            this.async(function(e) {
                                valueOf(e.success).shouldBeTrue();
                                valueOf(e.error).shouldBeFalse();
                            })
                        )});
					}
				})
			)});
			this.sequence.push(function() { Cloud.Reviews.query({
                    user_id: callback.Utils.userId
                },
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
					valueOf(e.error).shouldBeFalse();
					valueOf(e.reviews.length).shouldBe(0);
					valueOf(e.meta.total_results).shouldBe(0);
				})
			)});
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for remove response'
   	}),

    cloudReviewsCleanup: asyncTest({
        start: function(callback) {
            var data = {
                post_id: callback.Reviews.postId
            };
            Cloud.Posts.remove( data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for remove response'
   	}),

    // ---------------------------------------------------------------
    // Cloud.Clients
    // ---------------------------------------------------------------

    // Test that all of the namespace APIs are available
    cloudClientsApi: function() {
        // Verify that all of the methods are exposed
        this.verifyAPIs('Clients', [
            'geolocate'
        ]);
    },

    cloudClientsLocate: asyncTest({
   	    start: function(callback) {
   			Cloud.Clients.geolocate(
   				this.async(function(e) {
   					valueOf(e.success).shouldBeTrue();
   					valueOf(e.error).shouldBeFalse();
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for geolocate response'
   	}),

    cloudClientsLocateAppcelerator: asyncTest({
   	    start: function(callback) {
            var data = {
                ip_address: '184.72.37.109'
            };
   			Cloud.Clients.geolocate(data,
   				this.async(function(e) {
   					valueOf(e.success).shouldBeTrue();
   					valueOf(e.error).shouldBeFalse();
                    valueOf(e.ip_address).shouldBe('184.72.37.109');
                    valueOf(e.location.city).shouldBe('San Jose');
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for geolocate response'
   	}),

    // ---------------------------------------------------------------
    // Cloud.Emails
    // ---------------------------------------------------------------

    // Test that all of the namespace APIs are available
    cloudEmailsApi: function() {
        // Verify that all of the methods are exposed
        this.verifyAPIs('Emails', [
            'send'
        ]);
    },

    cloudEmailsSend: asyncTest({
   	    start: function(callback) {
            var data = {
                template: 'DrillbitTest',
                name: 'John Smith',
                subject: 'cloudEmailsSend Drillbit test',
                recipients: 'joe@smith.com',
                from: 'test@appcelerator.com'
            };
   			Cloud.Emails.send(data,
   				this.async(function(e) {
   					valueOf(e.success).shouldBeFalse();
   					valueOf(e.error).shouldBeTrue();
                    valueOf(e.code).shouldBe(422);
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for send response'
   	}),

    // ---------------------------------------------------------------
    // Cloud.PhotoCollections
    // ---------------------------------------------------------------

    // Test that all of the namespace APIs are available
    cloudPhotoCollectionsApi: function() {
        // Verify that all of the methods are exposed
        this.verifyAPIs('PhotoCollections', [
            'create',
            'show',
            'update',
            'search',
            'showSubcollections',
            'showPhotos',
            'remove'
        ]);
    },

    // Log in for the following tests
    cloudPhotoCollectionsLoginDrillbitUser: Utils.loginAsDrillbitUser,

    cloudPhotoCollectionsCreate: asyncTest({
   	    start: function(callback) {
   			var data = {
                name: 'collection1'
            };
   			Cloud.PhotoCollections.create(data,
   				this.async(function(e) {
   					valueOf(e.success).shouldBeTrue();
   					valueOf(e.error).shouldBeFalse();
                    valueOf(e.collections.length).shouldBe(1);
                    valueOf(e.collections[0].name).shouldBe('collection1');
                    valueOf(e.collections[0].counts).shouldBeObject();
                    valueOf(e.collections[0].counts.photos).shouldBe(0);
                    valueOf(e.collections[0].counts.total_photos).shouldBe(0);
                    valueOf(e.collections[0].counts.subcollections).shouldBe(0);
                    callback.PhotoCollections.ids.push(e.collections[0].id);
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for create response'
   	}),

    cloudPhotoCollectionsShow: asyncTest({
   	    start: function(callback) {
   			var data = {
                collection_id: callback.PhotoCollections.ids[0]
            };
   			Cloud.PhotoCollections.show(data,
   				this.async(function(e) {
   					valueOf(e.success).shouldBeTrue();
   					valueOf(e.error).shouldBeFalse();
                    valueOf(e.collections.length).shouldBe(1);
                    valueOf(e.collections[0].name).shouldBe('collection1');
                    valueOf(e.collections[0].counts).shouldBeObject();
                    valueOf(e.collections[0].counts.photos).shouldBe(0);
                    valueOf(e.collections[0].counts.total_photos).shouldBe(0);
                    valueOf(e.collections[0].counts.subcollections).shouldBe(0);
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for show response'
   	}),

    cloudPhotoCollectionsUpdate: asyncTest({
   	    start: function(callback) {
            var data = {
                photo: Titanium.Filesystem.getFile('apple_logo.jpg'),
                tags: 'apple, logo',
                'photo_sizes[preview]': '100x100#',
                'photo_sync_sizes[]': 'preview'
            };
            this.sequence.push(function() {	Cloud.Photos.create(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.photos.length).shouldBe(1);
                    callback.PhotoCollections.photoIds.push(e.photos[0].id);
                })
            )});
            this.sequence.push(function() { Cloud.PhotoCollections.update({
                    collection_id: callback.PhotoCollections.ids[0],
                    cover_photo_id: callback.PhotoCollections.photoIds[0],
                    custom_fields: {
                        company: 'Apple',
                        category: 'logo'
                    }
                },
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
               	    valueOf(e.error).shouldBeFalse();
                    valueOf(e.collections.length).shouldBe(1);
                    valueOf(e.collections[0].name).shouldBe('collection1');
                    valueOf(e.collections[0].counts).shouldBeObject();
                    valueOf(e.collections[0].counts.photos).shouldBe(0);
                    valueOf(e.collections[0].counts.total_photos).shouldBe(0);
                    valueOf(e.collections[0].counts.subcollections).shouldBe(0);
                    valueOf(e.collections[0].cover_photo).shouldBeObject();
                    valueOf(e.collections[0].cover_photo.id).shouldBe(callback.PhotoCollections.photoIds[0]);
                    valueOf(e.collections[0].cover_photo.tags).shouldContain('apple');
                    valueOf(e.collections[0].cover_photo.tags).shouldContain('logo');
                    valueOf(e.collections[0].custom_fields).shouldBeObject();
                    valueOf(e.collections[0].custom_fields.company).shouldBe('Apple');
                    valueOf(e.collections[0].custom_fields.category).shouldBe('logo');
                })
            )});
   		},
   		timeout: 15000,
   		timeoutError: 'Timed out waiting for update response'
   	}),

    cloudPhotoCollectionsSearch: asyncTest({
        start: function(callback) {
            var data = {
                user_id: callback.Utils.userId
            };
            Cloud.PhotoCollections.search(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.meta.total_pages).shouldBe(1);
                    valueOf(e.meta.total_results).shouldBe(1);
                    valueOf(e.collections.length).shouldBe(1);
                    valueOf(e.collections[0].name).shouldBe('collection1');
                    valueOf(e.collections[0].counts).shouldBeObject();
                    valueOf(e.collections[0].counts.photos).shouldBe(0);
                    valueOf(e.collections[0].counts.total_photos).shouldBe(0);
                 })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for search response'
    }),

    cloudPhotoCollectionsCreateAndAddPhoto: asyncTest({
   	    start: function(callback) {
            this.sequence.push(function() { Cloud.PhotoCollections.create({
                   name: 'collection2'
               },
               this.async(function(e) {
                   valueOf(e.success).shouldBeTrue();
                   valueOf(e.error).shouldBeFalse();
                   valueOf(e.collections.length).shouldBe(1);
                   valueOf(e.collections[0].name).shouldBe('collection2');
                   valueOf(e.collections[0].counts).shouldBeObject();
                   valueOf(e.collections[0].counts.photos).shouldBe(0);
                   valueOf(e.collections[0].counts.total_photos).shouldBe(0);
                   valueOf(e.collections[0].counts.subcollections).shouldBe(0);
                   callback.PhotoCollections.ids.push(e.collections[0].id);
               })
            )});
            this.sequence.push(function() {	Cloud.Photos.create({
                    photo: Titanium.Filesystem.getFile('appcelerator.jpg'),
                    tags: 'appcelerator, logo',
                    'photo_sizes[preview]': '100x100#',
                    'photo_sync_sizes[]': 'preview',
                    collection_id: callback.PhotoCollections.ids[1]
                },
   				this.async(function(e) {
   					valueOf(e.success).shouldBeTrue();
   					valueOf(e.error).shouldBeFalse();
                    valueOf(e.photos.length).shouldBe(1);
                    callback.PhotoCollections.photoIds.push(e.photos[0].id);
                })
            )});
            this.sequence.push(function() { Cloud.PhotoCollections.show({
                    collection_id: callback.PhotoCollections.ids[1]
                },
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.collections.length).shouldBe(1);
                    valueOf(e.collections[0].name).shouldBe('collection2');
                    valueOf(e.collections[0].counts).shouldBeObject();
                    valueOf(e.collections[0].counts.photos).shouldBe(1);
                    valueOf(e.collections[0].counts.total_photos).shouldBe(1);
                    valueOf(e.collections[0].counts.subcollections).shouldBe(0);
                })
            )});

        },
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for create response'
   	}),

    cloudPhotoCollectionsSearchAgain: asyncTest({
        start: function(callback) {
            var data = {
                user_id: callback.Utils.userId
            };
            Cloud.PhotoCollections.search(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.meta.total_pages).shouldBe(1);
                    valueOf(e.meta.total_results).shouldBe(2);
                    valueOf(e.collections.length).shouldBe(2);
                    for (var i = 0; i < e.collections.length; i++) {
                        if (e.collections[i].name == 'collection1') {
                            valueOf(e.collections[i].counts).shouldBeObject();
                            valueOf(e.collections[i].counts.photos).shouldBe(0);
                            valueOf(e.collections[i].counts.total_photos).shouldBe(0);
                        } else if (e.collections[i].name == 'collection2') {
                            valueOf(e.collections[i].counts).shouldBeObject();
                            valueOf(e.collections[i].counts.photos).shouldBe(1);
                            valueOf(e.collections[i].counts.total_photos).shouldBe(1);
                        } else {
                            callback.failed();
                        }
                    }
                 })
            );
        },
        timeout: 30000,
        timeoutError: 'Timed out waiting for search response'
    }),

    cloudPhotoCollectionsShowPhotos: asyncTest({
   	    start: function(callback) {
   			var data = {
                collection_id: callback.PhotoCollections.ids[1]
            };
   			Cloud.PhotoCollections.showPhotos(data,
   				this.async(function(e) {
   					valueOf(e.success).shouldBeTrue();
   					valueOf(e.error).shouldBeFalse();
                    valueOf(e.photos.length).shouldBe(1);
                    valueOf(e.photos[0].id).shouldBe(callback.PhotoCollections.photoIds[1]);
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for show response'
   	}),

    cloudPhotoCollectionsCreateSubcollection: asyncTest({
   	    start: function(callback) {
   			var data = {
                name: 'subcollection1',
                parent_collection_id: callback.PhotoCollections.ids[0]
            };
   			Cloud.PhotoCollections.create(data,
   				this.async(function(e) {
   					valueOf(e.success).shouldBeTrue();
   					valueOf(e.error).shouldBeFalse();
                    valueOf(e.collections.length).shouldBe(1);
                    valueOf(e.collections[0].name).shouldBe('subcollection1');
                    valueOf(e.collections[0].counts).shouldBeObject();
                    valueOf(e.collections[0].counts.photos).shouldBe(0);
                    valueOf(e.collections[0].counts.total_photos).shouldBe(0);
                    valueOf(e.collections[0].counts.subcollections).shouldBe(0);
                    callback.PhotoCollections.subIds.push(e.collections[0].id);
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for create response'
   	}),

    cloudPhotoCollectionsShowParent: asyncTest({
   	    start: function(callback) {
   			var data = {
                collection_id: callback.PhotoCollections.ids[0]
            };
   			Cloud.PhotoCollections.show(data,
   				this.async(function(e) {
   					valueOf(e.success).shouldBeTrue();
   					valueOf(e.error).shouldBeFalse();
                    valueOf(e.collections.length).shouldBe(1);
                    valueOf(e.collections[0].name).shouldBe('collection1');
                    valueOf(e.collections[0].counts).shouldBeObject();
                    valueOf(e.collections[0].counts.photos).shouldBe(0);
                    valueOf(e.collections[0].counts.total_photos).shouldBe(0);
                    valueOf(e.collections[0].counts.subcollections).shouldBe(1);
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for show response'
   	}),

    cloudPhotoCollectionsShowSubcollections: asyncTest({
   	    start: function(callback) {
   			var data = {
                collection_id: callback.PhotoCollections.ids[0]
            };
   			Cloud.PhotoCollections.showSubcollections(data,
   				this.async(function(e) {
   					valueOf(e.success).shouldBeTrue();
   					valueOf(e.error).shouldBeFalse();
                    valueOf(e.collections.length).shouldBe(1);
                    valueOf(e.collections[0].name).shouldBe('subcollection1');
                    valueOf(e.collections[0].counts).shouldBeObject();
                    valueOf(e.collections[0].counts.photos).shouldBe(0);
                    valueOf(e.collections[0].counts.total_photos).shouldBe(0);
                    valueOf(e.collections[0].counts.subcollections).shouldBe(0);
                    valueOf(e.collections[0].id).shouldBe(callback.PhotoCollections.subIds[0]);
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for show response'
   	}),

    cloudPhotoCollectionsQueryAndDeleteAllPhotos: asyncTest({
        start: function(callback) {
            var photoIds = [];
            // Delete all of the photos
			this.sequence.push(function() { Cloud.Photos.query(
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
					valueOf(e.error).shouldBeFalse();
					for (var i=0; i<e.photos.length; i++) {
                        photoIds.push(e.photos[i].id);
						this.sequence.unshift(function() { Cloud.Photos.remove({
                                photo_id: photoIds.pop()
                            },
                            this.async(function(e) {
                                valueOf(e.success).shouldBeTrue();
                                valueOf(e.error).shouldBeFalse();
                            })
                        )});
					}
				})
			)});
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for remove response'
   	}),

    cloudPhotoCollectionsQueryAndDeleteAllCollections: asyncTest({
        start: function(callback) {
            var collectionIds = [];
            var subIds = [];
            // Delete all of the photos
			this.sequence.push(function() { Cloud.PhotoCollections.search({
                    user_id: callback.Utils.userId
                },
				this.async(function(e) {
					valueOf(e.success).shouldBeTrue();
					valueOf(e.error).shouldBeFalse();
					for (var i = 0; i < e.collections.length; i++) {
                        collectionIds.push(e.collections[i].id);
						this.sequence.push(function() { Cloud.PhotoCollections.remove({
                                collection_id: collectionIds.pop()
                            },
                            this.async(function(e) {
                                valueOf(e.success).shouldBeTrue();
                                valueOf(e.error).shouldBeFalse();
                            })
                        )});
                        if (e.collections[i].counts.subcollections > 0) {
                            subIds.push(e.collections[i].id);
                            this.sequence.unshift(function() { Cloud.PhotoCollections.showSubcollections({
                                    collection_id: subIds.pop()
                                },
                                this.async(function(e) {
                                    for (var j =0; j < e.collections.length; j++) {
                                        collectionIds.push(e.collections[j].id);
                                        this.sequence.push(function() { Cloud.PhotoCollections.remove({
                                                collection_id: collectionIds.pop()
                                            },
                                            this.async(function(e) {
                                                valueOf(e.success).shouldBeTrue();
                                                valueOf(e.error).shouldBeFalse();
                                            })
                                        )});
                                    }
                                })
                            )});
                        }
					}
				})
			)});
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for remove response'
   	}),

    cloudPhotoCollectionsLogoutDrillbitUser: Utils.logout,

    // ---------------------------------------------------------------
    // Cloud.ACLs
    // ---------------------------------------------------------------

    // Test that all of the namespace APIs are available
    cloudACLsApi: function() {
        // Verify that all of the methods are exposed
        this.verifyAPIs('ACLs', [
            'create',
            'update',
            'show',
            'remove',
            'addUser',
            'removeUser',
            'checkUser'
        ]);
    },

    // Log in for the following tests
    cloudACLsLoginDrillbitUser: Utils.loginAsDrillbitUser,

    cloudACLsCreate: asyncTest({
   	    start: function(callback) {
   			var data = {
                name: 'testACL'
            };
   			Cloud.ACLs.create(data,
   				this.async(function(e) {
   					valueOf(e.success).shouldBeTrue();
   					valueOf(e.error).shouldBeFalse();
                    valueOf(e.acls[0].public_read).shouldBeFalse();
                    valueOf(e.acls[0].public_write).shouldBeFalse();
                    valueOf(e.acls[0].readers.length).shouldBe(1);
                    valueOf(e.acls[0].writers.length).shouldBe(1);
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for create response'
   	}),

    cloudACLsShow: asyncTest({
   	    start: function(callback) {
            var data = {
                name: 'testACL'
            };
            Cloud.ACLs.show(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
               	    valueOf(e.error).shouldBeFalse();
                    valueOf(e.acls[0].public_read).shouldBeFalse();
                    valueOf(e.acls[0].public_write).shouldBeFalse();
                    valueOf(e.acls[0].readers.length).shouldBe(1);
                    valueOf(e.acls[0].writers.length).shouldBe(1);
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for show response'
   	}),

    cloudACLsUpdate: asyncTest({
   	    start: function(callback) {
            var data = {
                name: 'testACL',
                public_read: true,
                public_write: true
            };
            Cloud.ACLs.update(data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
               	    valueOf(e.error).shouldBeFalse();
                    valueOf(e.acls[0].public_read).shouldBeTrue();
                    valueOf(e.acls[0].public_write).shouldBeTrue();
                    valueOf(e.acls[0].readers).shouldBeUndefined();
                    valueOf(e.acls[0].writers).shouldBeUndefined();

                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for update response'
   	}),

    cloudACLsAddRemoveUsers: asyncTest({
   	    start: function(callback) {
               var data = {
                   name: 'testACL',
                   public_read: false,
                   public_write: false
               }
            this.sequence.push(function() { Cloud.ACLs.update(data,
               this.async(function(e) {
                   valueOf(e.success).shouldBeTrue();
                   valueOf(e.error).shouldBeFalse();
                   valueOf(e.acls[0].public_read).shouldBeFalse();
                   valueOf(e.acls[0].public_write).shouldBeFalse();
                   valueOf(e.acls[0].readers.length).shouldBe(1);
                   valueOf(e.acls[0].writers.length).shouldBe(1);
               })
            )});
            this.sequence.push(function() { Cloud.Users.query(
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.users.length).shouldBe(2);
                    callback.ACLs.chatUserId = (e.users[0].id == callback.Utils.userId) ? e.users[1].id : e.users[0].id;
                })
            )});
            this.sequence.push(function() {	Cloud.ACLs.addUser({
                    name: 'testACL',
                    reader_ids: callback.ACLs.chatUserId,
                    writer_ids: callback.ACLs.chatUserId
                },
   				this.async(function(e) {
   					valueOf(e.success).shouldBeTrue();
   					valueOf(e.error).shouldBeFalse();
                })
            )});
            this.sequence.push(function() { Cloud.ACLs.show({
                    name: 'testACL'
                },
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                  	valueOf(e.error).shouldBeFalse();
                    valueOf(e.acls[0].public_read).shouldBeFalse();
                    valueOf(e.acls[0].public_write).shouldBeFalse();
                    valueOf(e.acls[0].readers.length).shouldBe(2);
                    valueOf(e.acls[0].writers.length).shouldBe(2);
                })
            )});
            this.sequence.push(function() {	Cloud.ACLs.removeUser({
                    name: 'testACL',
                    reader_ids: callback.ACLs.chatUserId,
                    writer_ids: ''
                },
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
               })
            )});
            this.sequence.push(function() { Cloud.ACLs.show({
                    name: 'testACL'
               },
               this.async(function(e) {
                   valueOf(e.success).shouldBeTrue();
                   valueOf(e.error).shouldBeFalse();
                   valueOf(e.acls[0].public_read).shouldBeFalse();
                   valueOf(e.acls[0].public_write).shouldBeFalse();
                   valueOf(e.acls[0].readers.length).shouldBe(1);
                   valueOf(e.acls[0].writers.length).shouldBe(2);
                   valueOf(e.acls[0].readers[0]).shouldBe(callback.Utils.userId);
               })
            )});
        },
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for add/remove response'
   	}),

    cloudACLsCheckUser: asyncTest({
   	    start: function(callback) {
            var data = {
               name: 'testACL',
               user_id: callback.Utils.userId
            }
            this.sequence.push(function() { Cloud.ACLs.checkUser({
                    name: 'testACL',
                    user_id: callback.Utils.userId
                },
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                    valueOf(e.permission['read permission']).shouldBe('yes');
                    valueOf(e.permission['write permission']).shouldBe('yes');
                })
            )});
            this.sequence.push(function() { Cloud.ACLs.checkUser({
                   name: 'testACL',
                   user_id: callback.ACLs.chatUserId
               },
               this.async(function(e) {
                   valueOf(e.success).shouldBeTrue();
                   valueOf(e.error).shouldBeFalse();
                   valueOf(e.permission['read permission']).shouldBe('no');
                   valueOf(e.permission['write permission']).shouldBe('yes');
               })
            )});
        },
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for checkUser response'
   	}),

    cloudACLsCleanup: asyncTest({
        start: function(callback) {
            var data = {
                name: 'testACL'
            };
            Cloud.ACLs.remove( data,
                this.async(function(e) {
                    valueOf(e.success).shouldBeTrue();
                    valueOf(e.error).shouldBeFalse();
                })
            );
   		},
   		timeout: 30000,
   		timeoutError: 'Timed out waiting for remove response'
   	})
});