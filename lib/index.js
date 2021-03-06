// Generated by CoffeeScript 1.10.0
(function() {
  var NoFilter, stream, util,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty;

  stream = require('stream');

  util = require('util');

  module.exports = NoFilter = (function(superClass) {
    var _read_gen, _write_gen, get;

    extend(NoFilter, superClass);

    function NoFilter(input, inputEncoding, options) {
      var inp, inpE, ref, watchPipe;
      if (options == null) {
        options = {};
      }
      inp = void 0;
      inpE = void 0;
      switch (typeof input) {
        case 'object':
          if (Buffer.isBuffer(input)) {
            inp = input;
            if ((inputEncoding != null) && (typeof inputEncoding === 'object')) {
              options = inputEncoding;
            }
          } else {
            options = input;
          }
          break;
        case 'string':
          inp = input;
          if ((inputEncoding != null) && (typeof inputEncoding === 'object')) {
            options = inputEncoding;
          } else {
            inpE = inputEncoding;
          }
      }
      if (options == null) {
        options = {};
      }
      if (inp == null) {
        inp = options.input;
      }
      if (inpE == null) {
        inpE = options.inputEncoding;
      }
      delete options.input;
      delete options.inputEncoding;
      watchPipe = (ref = options.watchPipe) != null ? ref : true;
      delete options.watchPipe;
      NoFilter.__super__.constructor.call(this, options);
      if (watchPipe) {
        this.on('pipe', (function(_this) {
          return function(readable) {
            var om;
            om = readable._readableState.objectMode;
            if ((_this.length > 0) && (om !== _this._readableState.objectMode)) {
              throw new Error('Do not switch objectMode in the middle of the stream');
            }
            _this._readableState.objectMode = om;
            return _this._writableState.objectMode = om;
          };
        })(this));
      }
      if (inp != null) {
        this.end(inp, inpE);
      }
    }

    NoFilter.isNoFilter = function(obj) {
      return obj instanceof this;
    };

    NoFilter.compare = function(nf1, nf2) {
      if (!(nf1 instanceof this)) {
        throw new TypeError('Arguments must be NoFilters');
      }
      if (nf1 === nf2) {
        return 0;
      } else {
        return nf1.compare(nf2);
      }
    };

    NoFilter.concat = function(list, length) {
      var bufs;
      if (!Array.isArray(list)) {
        throw new TypeError('list argument must be an Array of NoFilters');
      }
      if ((list.length === 0) || (length === 0)) {
        return new Buffer(0);
      }
      if (length == null) {
        length = list.reduce(function(tot, nf) {
          if (!(nf instanceof NoFilter)) {
            throw new TypeError('list argument must be an Array of NoFilters');
          }
          return tot + nf.length;
        }, 0);
      }
      bufs = list.map(function(nf) {
        if (!(nf instanceof NoFilter)) {
          throw new TypeError('list argument must be an Array of NoFilters');
        }
        if (nf._readableState.objectMode) {
          throw new Error('NoFilter may not be in object mode for concat');
        }
        return nf.slice();
      });
      return Buffer.concat(bufs, length);
    };

    NoFilter.prototype._transform = function(chunk, encoding, callback) {
      if (!this._readableState.objectMode && !Buffer.isBuffer(chunk)) {
        chunk = new Buffer(chunk, encoding);
      }
      this.push(chunk);
      return callback();
    };

    NoFilter.prototype._bufArray = function() {
      var b, bufs;
      bufs = this._readableState.buffer;
      if (!Array.isArray(bufs)) {
        b = bufs.head;
        bufs = [];
        while (b != null) {
          bufs.push(b.data);
          b = b.next;
        }
      }
      return bufs;
    };

    NoFilter.prototype.read = function(size) {
      var buf;
      buf = NoFilter.__super__.read.call(this, size);
      if (buf != null) {
        this.emit('read', buf);
      }
      return buf;
    };

    NoFilter.prototype.promise = function(cb) {
      var done;
      done = false;
      return new Promise((function(_this) {
        return function(resolve, reject) {
          _this.on('finish', function() {
            var data;
            data = _this.read();
            if ((cb != null) && !done) {
              done = true;
              cb(null, data);
            }
            return resolve(data);
          });
          return _this.on('error', function(er) {
            if ((cb != null) && !done) {
              done = true;
              cb(er);
            }
            return reject(er);
          });
        };
      })(this));
    };

    NoFilter.prototype.compare = function(other) {
      if (!(other instanceof NoFilter)) {
        throw new TypeError('Arguments must be NoFilters');
      }
      if (this._readableState.objectMode || other._readableState.objectMode) {
        throw new Error('Must not be in object mode to compare');
      }
      if (this === other) {
        return 0;
      } else {
        return this.slice().compare(other.slice());
      }
    };

    NoFilter.prototype.equals = function(other) {
      return this.compare(other) === 0;
    };

    NoFilter.prototype.slice = function(start, end) {
      var b, bufs;
      if (this._readableState.objectMode) {
        return this._bufArray().slice(start, end);
      } else {
        bufs = this._bufArray();
        switch (bufs.length) {
          case 0:
            return new Buffer(0);
          case 1:
            return bufs[0].slice(start, end);
          default:
            b = Buffer.concat(bufs);
            return b.slice(start, end);
        }
      }
    };

    NoFilter.prototype.get = function(index) {
      return this.slice()[index];
    };

    NoFilter.prototype.toJSON = function() {
      var b;
      b = this.slice();
      if (Buffer.isBuffer(b)) {
        return b.toJSON();
      } else {
        return b;
      }
    };

    NoFilter.prototype.toString = function(encoding, start, end) {
      return this.slice().toString(encoding, start, end);
    };

    NoFilter.prototype.inspect = function(depth, options) {
      var bufs, hex;
      bufs = this._bufArray();
      hex = bufs.map(function(b) {
        if (Buffer.isBuffer(b)) {
          if (options != null ? options.stylize : void 0) {
            return options.stylize(b.toString('hex'), 'string');
          } else {
            return b.toString('hex');
          }
        } else {
          return util.inspect(b, options);
        }
      }).join(', ');
      return this.constructor.name + " [" + hex + "]";
    };

    _read_gen = function(meth, len) {
      return function(val) {
        var b;
        b = this.read(len);
        if (!Buffer.isBuffer(b)) {
          return null;
        }
        return b[meth].call(b, 0, true);
      };
    };

    _write_gen = function(meth, len) {
      return function(val) {
        var b;
        b = new Buffer(len);
        b[meth].call(b, val, 0, true);
        return this.push(b);
      };
    };

    NoFilter.prototype.writeUInt8 = _write_gen('writeUInt8', 1);

    NoFilter.prototype.writeUInt16LE = _write_gen('writeUInt16LE', 2);

    NoFilter.prototype.writeUInt16BE = _write_gen('writeUInt16BE', 2);

    NoFilter.prototype.writeUInt32LE = _write_gen('writeUInt32LE', 4);

    NoFilter.prototype.writeUInt32BE = _write_gen('writeUInt32BE', 4);

    NoFilter.prototype.writeInt8 = _write_gen('writeInt8', 1);

    NoFilter.prototype.writeInt16LE = _write_gen('writeInt16LE', 2);

    NoFilter.prototype.writeInt16BE = _write_gen('writeInt16BE', 2);

    NoFilter.prototype.writeInt32LE = _write_gen('writeInt32LE', 4);

    NoFilter.prototype.writeInt32BE = _write_gen('writeInt32BE', 4);

    NoFilter.prototype.writeFloatLE = _write_gen('writeFloatLE', 4);

    NoFilter.prototype.writeFloatBE = _write_gen('writeFloatBE', 4);

    NoFilter.prototype.writeDoubleLE = _write_gen('writeDoubleLE', 8);

    NoFilter.prototype.writeDoubleBE = _write_gen('writeDoubleBE', 8);

    NoFilter.prototype.readUInt8 = _read_gen('readUInt8', 1);

    NoFilter.prototype.readUInt16LE = _read_gen('readUInt16LE', 2);

    NoFilter.prototype.readUInt16BE = _read_gen('readUInt16BE', 2);

    NoFilter.prototype.readUInt32LE = _read_gen('readUInt32LE', 4);

    NoFilter.prototype.readUInt32BE = _read_gen('readUInt32BE', 4);

    NoFilter.prototype.readInt8 = _read_gen('readInt8', 1);

    NoFilter.prototype.readInt16LE = _read_gen('readInt16LE', 2);

    NoFilter.prototype.readInt16BE = _read_gen('readInt16BE', 2);

    NoFilter.prototype.readInt32LE = _read_gen('readInt32LE', 4);

    NoFilter.prototype.readInt32BE = _read_gen('readInt32BE', 4);

    NoFilter.prototype.readFloatLE = _read_gen('readFloatLE', 4);

    NoFilter.prototype.readFloatBE = _read_gen('readFloatBE', 4);

    NoFilter.prototype.readDoubleLE = _read_gen('readDoubleLE', 8);

    NoFilter.prototype.readDoubleBE = _read_gen('readDoubleBE', 8);

    get = function(props) {
      var getter, name, results;
      results = [];
      for (name in props) {
        getter = props[name];
        results.push(NoFilter.prototype.__defineGetter__(name, getter));
      }
      return results;
    };

    get({
      length: function() {
        return this._readableState.length;
      }
    });

    return NoFilter;

  })(stream.Transform);

}).call(this);

//# sourceMappingURL=index.js.map
