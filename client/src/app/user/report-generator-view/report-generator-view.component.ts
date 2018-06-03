import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { AppModel } from '../../dto/appmodel'
import { EntityModel } from '../../dto/entitymodel'
import { ColumnModel } from '../../dto/columnmodel';
import { RelationModel } from '../../dto/relationmodel';
import { RelationType } from '../../dto/relationtype';
import { AppService } from '../../service/app.service';

@Component({
  selector: 'app-report-generator-view',
  templateUrl: './report-generator-view.component.html',
  styleUrls: ['./report-generator-view.component.css']
})
export class ReportGeneratorViewComponent implements OnInit {

  appModel: AppModel;
  formMode = 'Add';

  entityForm: FormGroup;
  relationForm: FormGroup;
  columns: any[] = [];
  sourceColumns = [];
  targetColumns = [];

  constructor(private fb: FormBuilder, private appService: AppService) { }

  ngOnInit() {
    this.appModel = new AppModel();
    this.appModel.entites = new Array<EntityModel>();
    this.appModel.appName = '';
    this.appModel.packageName = '';
    if (localStorage.getItem('data')) {
      this.appModel = JSON.parse(localStorage.getItem('data'));
    }
    this.init();
  }

  init() {
    this.entityForm = this.fb.group({
      name: '',
      columns: this.fb.array(this.formMode == 'Add' ? [this.createItem()] : [])
    });

    this.relationForm = this.fb.group({
      type: '',
      sourceTable: '',
      sourceColumn: '',
      targetTable: '',
      targetColumn: ''
    });
  }

  createItem(): FormGroup {
    return this.fb.group({
      name: '',
      type: '',
      mandatory: false,
      primary: false,
      unique: false,
      autoGen: false,
      relation: this.fb.group({
        columnName: '',
        tableName: '',
        relationType: ''
      })
    });
  }
  addItem(): void {
    let items = this.entityForm.get('columns') as FormArray;
    items.push(this.createItem());
    this.columns.push(this.createItem());
  }
  save(): void {
    if (this.formMode == 'Edit') {
      this.appModel.entites = this.appModel.entites.filter(data => data.name !== this.entityForm.value.name)
    }
    const entity = this.entityForm.value;
    if (!entity.columns.relation || !entity.columns.relation.columnName) {
      entity.columns.forEach(column => {
        column.relation = { undefined };
      })
    }
    debugger
    this.appModel.entites.push(entity);

  }

  addForm() {
    this.formMode = 'Add';
    this.init();
  }
  editForm(entity: EntityModel) {
    this.formMode = 'Edit';
    this.init();
    this.populateForm(entity);
  }
  populateForm(entity: EntityModel) {
    this.entityForm.get('name').setValue(entity.name);
    let data = <FormArray>this.entityForm.controls.columns;
    entity.columns.forEach(column => {
      const col = this.fb.group({
        name: column.name,
        type: column.type,
        mandatory: column.mandatory,
        primary: column.primary,
        unique: column.unique,
        autoGen: column.autoGen,
        relation: this.fb.group(
          column.relation !== undefined ? {
            columnName: column.relation.columnName,
            tableName: column.relation.tableName,
            relationType: column.relation.relationType
          } : {})
      });
      data.push(col);
    })
  }

  saveLocal() {
    debugger
    this.appModel.packageName = 'com.' + this.appModel.appName;
    localStorage.setItem('data', JSON.stringify(this.appModel));
  }

  build() {
    this.appModel.packageName = 'com.' + this.appModel.appName;
    this.appService.build(this.appModel);
  }

  download() {
    this.appService.download(this.appModel.appName);
  }

  remove(index) {
    let items = this.entityForm.get('columns') as FormArray;
    items.removeAt(index);
  }
  targetTableChange(targetTable) {
    this.targetColumns = [];
    this.appModel.entites.forEach(entity => {
      if (entity.name === targetTable) {
        entity.columns.forEach(column => {
          this.targetColumns.push(column.name);
        });
      }
    });
  }
  sourceTableChange(sourceTable) {
    this.sourceColumns = [];
    this.appModel.entites.forEach(entity => {
      if (entity.name === sourceTable) {
        entity.columns.forEach(column => {
          this.sourceColumns.push(column.name);
        });
      }
    });
  }

  saveRelation() {
    let relation = this.relationForm.value;
    this.appModel.entites.forEach(entity => {
      debugger
      if (entity.name === relation.sourceTable) {
        entity.columns.forEach(column => {
          if (column.name === relation.sourceColumn) {
            let relationModel = new RelationModel();
            relationModel.columnName = relation.targetColumn;
            relationModel.relationType = relation.type;
            relationModel.tableName = relation.targetTable;
            column.relation = relationModel;
          }
        });
      } else if (entity.name === relation.targetTable) {
        entity.columns.forEach(column => {
          if (column.name === relation.targetColumn) {
            let relationModel = new RelationModel();
            relationModel.columnName = relation.targetColumn;
            if (relation.type === "ONETOMANY") {
              let type: any = "MANYTOONE";
              relationModel.relationType = type;
            }
            else if (relation.type === "MANYTOONE") {
              let type: any = "ONETOMANY";
              relationModel.relationType = type;
            }
            else
              relationModel.relationType = relation.type;
            relationModel.tableName = relation.targetTable;
            column.relation = relationModel;

          }
        });
      }
    });
  }
  dataTypes = ['String', 'Integer', 'Long', 'Double', 'Date', 'LocalDate', 'LocalDateTime', 'Boolean'];
}
